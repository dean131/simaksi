import { prisma } from "../prisma.js";

export const authMiddleware = async (req, res, next) => {
    const id = parseInt(req.get('Authorization'));
    if (!id) {
        res.status(401).json({
            errors: "Unauthorized"
        }).end();
    } else {
        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });
        if (!user) {
            res.status(401).json({
                errors: "Unauthorized"
            }).end();
        } else {
            req.user = user;
            next();
        }
    }
}