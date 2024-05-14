import { prisma } from "../prisma.js";

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

export default {
	trip,
	route,
	checkpoint,
};
