import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";

const create = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
        const createTripValidation = Joi.object({
            route_id: Joi.number().required(),
            date: Joi.date().required(),
            user_id: Joi.number().required()
        });
        // Validasi data yang diterima dari client
        const result = createTripValidation.validate(req.body);
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Menyimpan data trip ke database
        const trip = await  prisma.trip.create({
            data: result.value
        });
        // Mengirimkan data trip ke client
        res.json({data: trip});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const list = async (req, res, next) => {
    try {
        // Mengambil user_id dari query string
        const user_id = parseInt(req.query.user_id);
        // Mengambil data trip dari database
        let trip;
        if (user_id) {
            trip = await prisma.trip.findMany({
                where: {
                    user_id: user_id
                }
            });
        } else {
            trip = await prisma.trip.findMany();
        }
        // Mengirimkan data trip ke client
        res.json({data: trip});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const get = async (req, res, next) => {
    try {
        // Mengambil id trip dari parameter
        const id = parseInt(req.params.id);
        // Mengambil data trip dari database
        const trip = await prisma.trip.findFirst({
            where: {
                id: id
            },
            include: {
                route: true,
                members: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        // Jika trip tidak ditemukan, kirimkan error
        if (!trip) {
            throw new ResponseError(404, "Trip not found");
        }
        // Menghapus route_id dan user_id dari trip
        delete trip.route_id;
        delete trip.user_id;
        // Mengirimkan data trip ke client
        res.json({data: trip});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

export default {
    create,
    list,
    get
}