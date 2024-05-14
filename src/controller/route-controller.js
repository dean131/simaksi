import { prisma } from "../prisma.js";
import Joi from "joi";

const list = async (req, res, next) => {
	try {
		const routes = await prisma.route.findMany();
		res.json({
			data: routes,
		});
	} catch (error) {
		next(error);
	}
};

const update = async (req, res, next) => {
	try {
		// Mengambil id route dari parameter
		const id = parseInt(req.params.id);
		// Validasi data route
		const schema = Joi.object({
			name: Joi.string().required(),
			price: Joi.number().required(),
			is_open: Joi.boolean().required(),
		});
		const result = schema.validate(req.body);
		if (result.error) {
			throw new ResponseError(400, result.error.message);
		}
		// Cek apakah route dengan id tersebut ada di database
		const isRouteExist = await prisma.route.findFirst({
			where: {
				id: id,
			},
		});
		if (!isRouteExist) {
			throw new ResponseError(404, "Route not found");
		}
		// Mengupdate data route di database
		const route = await prisma.route.update({
			where: {
				id: id,
			},
			data: result.value,
		});
		// Mengirimkan data route yang telah diupdate ke client
		res.json({
			data: route,
		});
	} catch (error) {
		// Mengirimkan error ke middleware error handler
		next(error);
	}
};

export default {
	update,
	list,
};
