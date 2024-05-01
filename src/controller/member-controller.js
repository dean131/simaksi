import { prisma } from "../prisma.js";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";

const create = async (req, res, next) => {
    try {
        // validasi input
        const schema = Joi.object({
            user_id: Joi.number().required(),
            trip_id: Joi.number().required()
        });
        const result = schema.validate(req.body);
        // jika input tidak valid
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // membuat member baru
        const member = await prisma.member.create({
            data: {
                user_id: req.body.user_id,
                trip_id: req.body.trip_id
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                },
                trip: {
                    select: {
                        route_id: true,
                        date: true
                    }
                }
            }
        });
        // memberikan response
        res.json({ data: member });
        
    } catch (error) {
        // mengirim error ke middleware error
        next(error);
    }
}

const list = async (req, res, next) => {
    try {
        const trip_id = parseInt(req.query.trip_id);
        let member;
        if (trip_id) {
            member = await prisma.member.findMany({
                where: {
                    trip_id: trip_id
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true
                        }
                    },
                    trip: {
                        select: {
                            route_id: true,
                            date: true
                        }
                    }
                }
            });
        } else {
            member = await prisma.member.findMany({
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true
                        }
                    },
                    trip: {
                        select: {
                            route_id: true,
                            date: true
                        }
                    }
                }
            });
        }
        // memberikan response
        res.json({ data: member });
    } catch (error) {
        // mengirim error ke middleware error
        next(error);
    }
}

const remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const member = await prisma.member.delete({
            where: {
                id: id
            }
        });
        // memberikan response
        res.json({ data: member });
    } catch (error) {
        // mengirim error ke middleware error
        next(error);
    }
}

export default {
    create,
    list,
    remove
}