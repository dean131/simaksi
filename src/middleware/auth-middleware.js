import { prisma } from "../prisma.js";

export const apiMiddleware = async (req, res, next) => {
	console.log(`API middleware ${req.url}`);
	const id = parseInt(req.get("Authorization"));
	if (!id) {
		res.status(401)
			.json({
				errors: "Unauthorized",
			})
			.end();
	} else {
		const user = await prisma.user.findFirst({
			where: {
				id: id,
			},
		});
		if (!user) {
			res.status(401)
				.json({
					errors: "Unauthorized",
				})
				.end();
		} else {
			req.user = user;
			next();
		}
	}
};

export const adminMiddleware = async (req, res, next) => {
	if (!req.cookies["user_id"]) {
		return res.redirect("/admin/login");
	}

	const user = prisma.user.findUnique({
		where: {
			id: req.cookies.user_id,
		},
	});

	if (!user) {
		return res.redirect("/admin/login");
	}

	req.user = user;
	next();
};
