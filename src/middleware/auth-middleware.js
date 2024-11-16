import { prisma } from "../application/prisma.js";
import { logger } from "../application/logging.js";

export const apiMiddleware = async (req, res, next) => {
    const id = parseInt(req.get("Authorization"));

    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });

    if (!user) {
        logger.error("Unauthorized");
        res.status(401)
            .json({
                errors: "Unauthorized",
            })
            .end();
    } else {
        req.user = user;
        next();
    }
};

export const adminMiddleware = async (req, res, next) => {
    if (!req.cookies["admin_id"]) {
        logger.error("Admin Unauthorized: admin_id cookie not found");
        return res.redirect("/admin/login");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(req.cookies.admin_id),
        },
    });

    if (!user) {
        logger.error("Admin Unauthorized: Invalid admin_id cookie");
        return res.redirect("/admin/login");
    }

    req.user = user;
    next();
};
