import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";

const route = async (req, res) => {
	let route = await prisma.route.findFirst();
	// Jika route tidak ditemukan, buat satu route baru
	if (!route) {
		route = await prisma.route.create({
			data: {
				name: "Alang-alang Sewu",
				price: 25000,
				is_open: true,
			},
		});
	}
	res.render("route", {
		layout: "main-layout",
		title: "Trip",
		route: route,
	});
};

const trip = async (req, res) => {
	// Mengambil data trip dari database
	const trips = await prisma.trip.findMany({
		include: {
			user: true,
			payment: true,
			members: {
				include: {
					user: true,
				},
			},
		},
		orderBy: {
			canceled_at: "desc",
		},
	});

	const tripsWithStatus = trips.map((trip) => {
		// ubah fromat waktu
		if (trip.created_at) {
			trip.start_date = trip.start_date.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
			trip.end_date = trip.end_date.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		}
		// Tambahkan atribut "status" berdasarkan kondisi
		if (trip.canceled_at) {
			return { ...trip, status: "dibatalkan" };
		} else if (trip.checked_out_at) {
			return { ...trip, status: "selesai" };
		} else if (trip.checked_in_at) {
			return { ...trip, status: "aktif" };
		} else if (trip.payment && trip.payment.status === "settlement") {
			return { ...trip, status: "lunas" };
		} else if (trip.payment && trip.payment.status === "pending") {
			return { ...trip, status: "menunggu" };
		}
	});

	console.log(tripsWithStatus);

	res.render("trip", {
		layout: "main-layout",
		title: "Trip",
		trips: tripsWithStatus,
	});
};

const checkpoint = async (req, res) => {
	// Mengambil data checkpoint dari database
	const checkpoints = await prisma.checkPoint.findMany();

	res.render("checkpoint", {
		layout: "main-layout",
		title: "Trip",
		checkpoints: checkpoints,
	});
};

const payment = async (req, res) => {
	const trips = await prisma.trip.findMany({
		include: {
			user: true,
			payment: true,
		},
		orderBy: {
			canceled_at: "desc",
		},
	});

	res.render("payment", {
		layout: "main-layout",
		title: "Payment",
		trips: trips,
	});
};

const login = async (req, res) => {
	res.render("login", {
		layout: "auth-layout",
	});
};

const performLogin = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.redirect("/admin/login");
	}

	// Mengecek apakah email dan password sesuai
	const admin = await prisma.admin.findUnique({
		where: {
			email: email,
		},
	});

	if (!admin) {
		return res.redirect("/admin/login");
	}

	// Mengecek apakah password sesuai
	const isPasswordValid = await bcrypt.compare(password, admin.password);
	if (!isPasswordValid) {
		return res.redirect("/admin/login");
	}

	if (admin) {
		res.cookie("admin_id", admin.id);
		return res.redirect("/admin/route");
	} else {
		return res.redirect("/admin/login");
	}
};

const register = async (req, res) => {
	return res.render("register", {
		layout: "auth-layout",
	});
};

const performRegister = async (req, res) => {
	const { email, password, name, phone } = req.body;

	if (!email || !password) {
		return res.redirect("/admin/register");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const admin = await prisma.admin.create({
		data: {
			email: email,
			password: hashedPassword,
			name: name,
			phone: phone,
		},
	});

	if (admin) {
		return res.redirect("/admin/login");
	}
};

const logout = async (req, res) => {
	res.clearCookie("admin_id");
	return res.redirect("/admin/login");
};

export default {
	trip,
	route,
	checkpoint,
	payment,
	login,
	performLogin,
	logout,
	register,
	performRegister,
};
