import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";

const get = async (req, res, next) => {
	try {
		// Mengambil id checkpoint dari parameter
		const id = parseInt(req.params.id);
		// Mengambil data checkpoint dari database
		const checkpoint = await prisma.checkPoint.findUnique({
			where: {
				id: id,
			},
		});
		// Mengirimkan data checkpoint ke client
		res.json({
			data: checkpoint,
		});
	} catch (error) {
		next(error);
	}
};

const create = async (req, res, next) => {
	try {
		// Membuat schema validasi
		const schema = Joi.object({
			name: Joi.string().required(),
			description: Joi.string().required(),
		});
		const result = schema.validate(req.body);
		if (result.error) {
			throw new ResponseError(400, error.message);
		}
		// Jika file gambar diupload
		if (req.file) {
			result.value.picture = req.file.path;
		}
		// Menambahkan data checkpoint ke database
		const checkpoint = await prisma.checkPoint.create({
			data: result.value,
		});
		res.json({
			data: checkpoint,
		});
	} catch (error) {
		next(error);
	}
};

const list = async (req, res, next) => {
	try {
		const checkpoint = await prisma.checkPoint.findMany();
		res.json({ data: checkpoint });
	} catch (error) {
		next(error);
	}
};

const update = async (req, res, next) => {
	try {
		// Mengambil id checkpoint dari parameter
		const id = parseInt(req.params.id);
		// Membuat schema validasi
		const schema = Joi.object({
			name: Joi.string().required(),
			description: Joi.string().required(),
		});
		const result = schema.validate(req.body);
		if (result.error) {
			throw new ResponseError(400, error.message);
		}
		// Jika file gambar diupload
		if (req.file) {
			result.value.picture = req.file.path;
		}
		// Mengupdate data checkpoint di database
		const checkpoint = await prisma.checkPoint.update({
			where: {
				id: id,
			},
			data: result.value,
		});
		res.json({
			data: checkpoint,
		});
	} catch (error) {
		next(error);
	}
};

const remove = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const checkpoint = await prisma.checkPoint.delete({
			where: {
				id: id,
			},
		});
		res.json({
			data: checkpoint,
		});
	} catch (error) {
		next(error);
	}
};

export default {
	get,
	list,
	remove,
	update,
	create,
};
