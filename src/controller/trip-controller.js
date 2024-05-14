import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";
import { coreApi } from "../midtrans.js";

const create = async (req, res, next) => {
	try {
		// Validasi data yang diterima dari client
		const createTripValidation = Joi.object({
			route_id: Joi.number().required(),
			start_date: Joi.date().required(),
			end_date: Joi.date().required(),
			user_id: Joi.number().required(),
		});
		// Validasi data yang diterima dari client
		const result = createTripValidation.validate(req.body);
		if (result.error) {
			throw new ResponseError(400, result.error.message);
		}
		// Menghapus trip dengan user_id dan created_at = null
		await prisma.trip.deleteMany({
			where: {
				user_id: result.value.user_id,
				created_at: null,
			},
		});
		// Menyimpan data trip ke database
		const trip = await prisma.trip.create({
			data: result.value,
		});
		// Mengirimkan data trip ke client
		res.json({ data: trip });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const confirmCreate = async (req, res, next) => {
	try {
		// Mengambil nama bank dari parameter
		const bank = req.body.bank;
		// Mengambil data trip dari database
		const trip = await prisma.trip.findFirst({
			where: {
				user_id: req.user.id,
				created_at: null,
			},
			include: {
				route: true,
			},
		});
		// Jika trip tidak ditemukan, kirimkan error
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// Mengupdate trip dengan is_created = true
		await prisma.trip.update({
			where: {
				id: trip.id,
			},
			data: {
				created_at: new Date(),
			},
		});
		// Membuat payload untuk request pembayaran
		let parameter = {
			payment_type: "bank_transfer",
			transaction_details: {
				order_id: trip.id.toString(),
				gross_amount: trip.route.price,
			},
			bank_transfer: {
				bank: bank,
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
		console.log(chargeResponse.status_code);
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
				bank: bank,
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
				canceled_at: new Date(),
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
		const status = req.body.status_code;
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
		// Mengirimkan pesan ke client
		res.json({ message: "Payment notification received" });
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

const list = async (req, res, next) => {
	try {
		// Mengambil user_id dari request
		const user_id = req.user.id;
		// mengambil data filter dari query
		const status = req.query.status;
		const orderByParam = req.query.order === "terbaru" ? "desc" : "asc";
		// Menentukan query berdasarkan status
		let query = {};
		switch (status) {
			case "menunggu":
				query = {
					user_id: user_id,
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
					user_id: user_id,
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
					user_id: user_id,
					checked_in_at: { not: null },
					checked_out_at: null,
					canceled_at: null,
					created_at: { not: null },
				};
			case "selesai":
				query = {
					user_id: user_id,
					checked_in_at: { not: null },
					checked_out_at: { not: null },
					canceled_at: null,
					created_at: { not: null },
				};
				break;
			case "ditolak":
				query = {
					user_id: user_id,
					checked_in_at: null,
					checked_out_at: null,
					canceled_at: { not: null },
					created_at: { not: null },
				};
				break;
			default:
				query = {
					user_id: user_id,
				};
		}
		// Mengambil data trip dari database
		const trips = await prisma.trip.findMany({
			where: query,
			orderBy: {
				created_at: orderByParam,
			},
		});
		// Mengirimkan data trip ke client
		res.json({ data: trips });
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

export default {
	create,
	confirmCreate,
	cancel,
	paymentNotification,
	list,
	get,
};
