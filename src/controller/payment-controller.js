import e from "express";
import { prisma } from "../application/prisma.js";

const list = async (req, res, next) => {
    try {
        const payments = await prisma.payment.findMany();
        res.json({
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    list,
};
