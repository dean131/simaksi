import { prisma } from "../application/prisma.js";

export const apiMiddleware = async (req, res, next) => {
    const id = parseInt(req.get("Authorization"));

    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });

    if (!user) {
        console.log("Unauthorized: User not found");
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
        console.log("Admin Unauthorized: No admin_id cookie found");
        return res.redirect("/admin/login");
    }

    const user = prisma.user.findUnique({
        where: {
            id: req.cookies.user_id,
        },
    });

    if (!user) {
        console.log("Admin Unauthorized: User not found");
        return res.redirect("/admin/login");
    }

    req.user = user;
    next();
};
