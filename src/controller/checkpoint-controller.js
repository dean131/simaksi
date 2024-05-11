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
                id: id
            }
        });
        // Mengirimkan data checkpoint ke client
        res.json({ data: checkpoint });
    } catch (error) {
        next(error);
    }
}

const list = async (req, res, next) => {
    try {
        const checkpoint = await prisma.checkPoint.findMany();
        res.json({ data: checkpoint });
    } catch (error) {
        next(error);
    }
}

export default {
    get,
    list
}