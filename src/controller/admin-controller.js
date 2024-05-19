import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";

const route = async (req, res) => {
	const route = await prisma.route.findFirst();
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
		},
		orderBy: {
			canceled_at: "desc",
		},
	});

	const tripsWithStatus = trips.map((trip) => {
		// ubah fromat waktu
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
		// Tambahkan atribut "status" berdasarkan kondisi
		if (trip.canceled_at) {
			return { ...trip, status: "dibatalkan" };
		} else if (trip.checked_out_at) {
			return { ...trip, status: "selesai" };
		} else if (trip.checked_in_at) {
			return { ...trip, status: "berlangsung" };
		} else {
			return { ...trip, status: "belum dimulai" };
		}
	});

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
	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	// Mengecek apakah password sesuai
	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.redirect("/admin/login");
	}

	if (user) {
		res.cookie("user_id", user.id);
		return res.redirect("/admin/route");
	} else {
		return res.redirect("/admin/login");
	}
};

const logout = async (req, res) => {
	res.clearCookie("user_id");
	return res.redirect("/admin/login");
};

export default {
	trip,
	route,
	checkpoint,
	login,
	performLogin,
	logout,
};
