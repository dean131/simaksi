import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";

const create = async (req, res, next) => {
	try {
		// validasi input
		const schema = Joi.object({
			user_id: Joi.number().required(),
		});
		const result = schema.validate(req.body);
		// jika input tidak valid
		if (result.error) {
			throw new ResponseError(400, result.error.message);
		}
		const trip = await prisma.trip.findFirst({
			where: {
				user_id: req.user.id,
				created_at: null,
			},
		});
		// jika trip tidak ditemukan
		if (!trip) {
			throw new ResponseError(404, "Trip not found");
		}
		// membuat member baru
		await prisma.member.create({
			data: {
				user_id: result.value.user_id,
				trip_id: trip.id,
			},
		});
		// mengambil semua member berdasarkan trip_id
		const members = await prisma.member.findMany({
			where: {
				trip_id: trip.id,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
		// memberikan response
		res.json({ data: members });
	} catch (error) {
		// mengirim error ke middleware error
		next(error);
	}
};

const list = async (req, res, next) => {
	try {
		const trip_id = parseInt(req.query.trip_id);
		let member;
		if (trip_id) {
			member = await prisma.member.findMany({
				where: {
					trip_id: trip_id,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		} else {
			member = await prisma.member.findMany({
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		}
		// memberikan response
		res.json({ data: member });
	} catch (error) {
		// mengirim error ke middleware error
		next(error);
	}
};

const remove = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const trip = await prisma.trip.findFirst({
			where: {
				user_id: req.user.id,
				created_at: null,
			},
		});
		// Menghapus member berdasarkan id
		await prisma.member.delete({
			where: {
				id: id,
			},
		});
		// mengambil semua member berdasarkan trip_id
		const members = await prisma.member.findMany({
			where: {
				trip_id: trip.id,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
		// memberikan response
		res.json({ data: members });
	} catch (error) {
		// mengirim error ke middleware error
		next(error);
	}
};

export default {
	create,
	list,
	remove,
};
