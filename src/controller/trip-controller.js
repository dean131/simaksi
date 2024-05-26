import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";
import { coreApi } from "../midtrans.js";
import moment from "moment-timezone";

import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";

const generatePDF = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const trip = await prisma.trip.findFirst({
			where: {
				id: id,
			},
			include: {
				route: true,
				user: true,
				members: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}

		// Menghitung usia dari tanggal lahir setiap member
		trip.members.forEach((member) => {
			const birthDate = new Date(member.user.date_of_birth);
			const diff = Date.now() - birthDate.getTime();
			member.user.age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
		});

		// Menghitung hari trip
		const diff = trip.end_date - trip.start_date;
		trip.days = diff / (1000 * 60 * 60 * 24);

		// Merender template invoice.ejs
		const html = await ejs.renderFile(
			path.resolve("src/views/invoice.ejs"),
			{ trip: trip },
			{ async: true }
		);
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setContent(html);
		const pdfBuffer = await page.pdf();
		await browser.close(); // tutup browser

		res.set("Content-Type", "application/pdf");
		res.send(pdfBuffer);
	} catch (error) {
		next(error);
	}
};

const create = async (req, res, next) => {
	try {
		const route = await prisma.route.findFirstOrThrow();
		// Jika route tidak ditemukan, kirimkan error
		if (!route) {
			throw new ResponseError(404, "Route not found");
		}
		// cari trip yang belum selesai
		const trip = await prisma.trip.findFirst({
			where: {
				user_id: req.user.id,
				created_at: null,
			},
		});
		// jika trip ditemukan, hapus trip
		if (trip) {
			await prisma.$transaction(async (prisma) => {
				await prisma.member.deleteMany({
					where: {
						trip_id: trip.id,
					},
				});
				await prisma.trip.delete({
					where: {
						id: trip.id,
					},
				});
			});
		}
		// membuat trip baru
		const newTrip = await prisma.trip.create({
			data: {
				user_id: req.user.id,
				route_id: route.id,
			},
		});
		// Mengirimkan data trip ke client
		res.json({ data: newTrip });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const confirmCreate = async (req, res, next) => {
	try {
		// Validasi data yang diterima dari client
		const schema = Joi.object({
			start_date: Joi.date().required(),
			end_date: Joi.date().required(),
			bank: Joi.string().valid("bca", "bni", "bri").required(),
		});
		const result = schema.validate(req.body);
		if (result.error) {
			throw new ResponseError(400, result.error.message);
		}
		// Mengambil data trip dari database
		let trip = await prisma.trip.findFirst({
			where: {
				user_id: req.user.id,
				created_at: null,
			},
			include: {
				route: true,
				members: true,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Mengupdate trip dengan created_at
		trip = await prisma.trip.update({
			where: {
				id: trip.id,
			},
			data: {
				start_date: new Date(result.value.start_date),
				end_date: new Date(result.value.end_date),
				created_at: moment().tz("Asia/Jakarta").toDate(),
			},
			select: {
				route: true,
				members: true,
			},
		});
		// Membuat payload untuk request pembayaran
		let parameter = {
			payment_type: "bank_transfer",
			transaction_details: {
				order_id: trip.id.toString(),
				gross_amount: trip.route.price * (trip.members.length + 1),
			},
			bank_transfer: {
				bank: result.value.bank,
			},
			customer_details: {
				email: req.user.email,
				name: req.user.name,
				phone: req.user.phone,
			},
		};
		// Membuat request pembayaran ke Midtrans
		let chargeResponse = await coreApi.charge(parameter);
		// Check response dari Midtrans
		if (chargeResponse.status_code !== "201") {
			throw new ResponseError(500, "Failed to create payment");
		}
		// Menyimpan data payment ke database
		await prisma.payment.create({
			data: {
				status: chargeResponse.transaction_status,
				transaction_id: chargeResponse.transaction_id,
				price: parseFloat(chargeResponse.gross_amount),
				expiration: new Date(chargeResponse.expiry_time),
				bank: result.value.bank,
				va_number: chargeResponse.va_numbers[0].va_number,
				trip_id: trip.id,
			},
		});
		// Mengirimkan data response ke client
		res.json({ data: chargeResponse });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const cancel = async (req, res, next) => {
	try {
		// Mengambil id trip dari parameter
		const id = parseInt(req.params.id);
		// Mengambil data trip dari database
		const trip = await prisma.trip.findFirst({
			where: {
				id: id,
				created_at: { not: null },
			},
			include: {
				payment: true,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Cek apakah sudah membayar
		if (trip.payment.status === "settlement") {
			throw new ResponseError(400, "Cannot cancel paid trip");
		}
		// Cancel payment di Midtrans
		const response = await coreApi.transaction.cancel(
			trip.payment.transaction_id
		);

		if (response.status_code !== "200") {
			throw new ResponseError(500, "Failed to cancel payment");
		}
		// Menghapus trip dari database
		await prisma.trip.update({
			where: {
				id: id,
			},
			data: {
				canceled_at: moment().tz("Asia/Jakarta").toDate(),
				payment: {
					update: {
						status: response.transaction_status,
					},
				},
			},
		});
		// Mengirimkan pesan ke client
		res.json({ message: "Trip canceled" });
	} catch (error) {
		next(error);
	}
};

const paymentNotification = async (req, res, next) => {
	try {
		// Mengambil data dari Midtrans
		const transaction_id = req.body.transaction_id;
		const transaction_status = req.body.transaction_status;
		// Mengambil data payment dari database
		const payment = await prisma.payment.findFirst({
			where: {
				transaction_id: transaction_id,
			},
		});
		// Jika payment tidak ditemukan, kirimkan error
		if (!payment) {
			throw new ResponseError(404, "Payment not found");
		}
		// Mengupdate status payment
		await prisma.payment.update({
			where: {
				id: payment.id,
			},
			data: {
				status: transaction_status,
			},
		});
		// Mengirimkan pesan ke midtrans
		res.status(200).json({ status: "OK" });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const list = async (req, res, next) => {
	try {
		// mengambil data filter dari query
		const status = req.query.status ? req.query.status : "all";
		const orderByParam = req.query.order === "terbaru" ? "desc" : "asc";
		// Menentukan query berdasarkan status
		let query = {};
		switch (status) {
			case "menunggu":
				query = {
					user_id: req.user.id,
					checked_in_at: null,
					checked_out_at: null,
					canceled_at: null,
					created_at: { not: null },
					payment: {
						status: "pending",
					},
				};
				break;
			case "lunas":
				query = {
					user_id: req.user.id,
					checked_in_at: null,
					checked_out_at: null,
					canceled_at: null,
					created_at: { not: null },
					payment: {
						status: "settlement",
					},
				};
				break;
			case "aktif":
				query = {
					user_id: req.user.id,
					checked_in_at: { not: null },
					checked_out_at: null,
					canceled_at: null,
					created_at: { not: null },
				};
			case "selesai":
				query = {
					user_id: req.user.id,
					checked_in_at: { not: null },
					checked_out_at: { not: null },
					canceled_at: null,
					created_at: { not: null },
				};
				break;
			case "ditolak":
				query = {
					user_id: req.user.id,
					checked_in_at: null,
					checked_out_at: null,
					canceled_at: { not: null },
					created_at: { not: null },
				};
				break;
			default:
				query = {
					user_id: req.user.id,
				};
		}
		// Mengambil data trip dari database
		const trips = await prisma.trip.findMany({
			where: query,
			orderBy: {
				created_at: orderByParam,
			},
			include: {
				payment: true,
			},
		});
		// tambah status ke data trip
		const tripsWithStatus = trips.map((trip) => {
			if (trip.canceled_at) {
				return { ...trip, status: "dibatalkan" };
			} else if (trip.checked_out_at) {
				return { ...trip, status: "selesai" };
			} else if (trip.checked_in_at) {
				return { ...trip, status: "aktif" };
			} else if (
				trip.created_at != null &&
				trip.payment.status === "settlement"
			) {
				return { ...trip, status: "lunas" };
			} else if (
				trip.payment != null &&
				trip.payment.status === "pending"
			) {
				return { ...trip, status: "menunggu" };
			}
		});
		// Mengirimkan data trip ke client
		res.json({ data: tripsWithStatus });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const get = async (req, res, next) => {
	try {
		// Mengambil id trip dari parameter
		const id = parseInt(req.params.id);
		// Mengambil data trip dari database
		const trip = await prisma.trip.findFirst({
			where: {
				id: id,
			},
			include: {
				route: true,
				members: {
					include: {
						user: {
							select: {
								email: true,
								name: true,
							},
						},
					},
				},
				payment: true,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Menghapus route_id dan user_id dari trip
		delete trip.route_id;
		delete trip.user_id;
		// Mengirimkan data trip ke client
		res.json({ data: trip });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const checkIn = async (req, res, next) => {
	try {
		console.log(req.body);
		// Mengambil id trip dari parameter
		const id = parseInt(req.params.id);
		// Mengambil data trip dari database
		const trip = await prisma.trip.findFirst({
			where: {
				id: id,
				// user_id: req.user.id,
				// created_at: { not: null },
				// checked_in_at: null,
				// checked_out_at: null,
				// canceled_at: null,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Mengupdate trip dengan checked_in_at
		await prisma.trip.update({
			where: {
				id: id,
			},
			data: {
				checked_in_at: moment().tz("Asia/Jakarta").toDate(),
			},
		});
		// Mengirimkan pesan ke client
		res.json({ message: "Check in success" });
	} catch (error) {
		next(error);
	}
};

const checkOut = async (req, res, next) => {
	try {
		// Mengambil id trip dari parameter
		const id = parseInt(req.params.id);
		// Mengambil data trip dari database
		const trip = await prisma.trip.findFirst({
			where: {
				id: id,
				// user_id: req.user.id,
				// created_at: { not: null },
				// checked_in_at: { not: null },
				// checked_out_at: null,
				// canceled_at: null,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Mengupdate trip dengan checked_out_at
		await prisma.trip.update({
			where: {
				id: id,
			},
			data: {
				checked_out_at: moment().tz("Asia/Jakarta").toDate(),
			},
		});
		// Mengirimkan pesan ke client
		res.json({ message: "Check out success" });
	} catch (error) {
		next(error);
	}
};

export default {
	generatePDF,
	create,
	confirmCreate,
	cancel,
	checkIn,
	checkOut,
	paymentNotification,
	list,
	get,
};
