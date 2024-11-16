import { prisma } from "../application/prisma.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import { WebError } from "../utils/response-error.js";
import { generateUserId } from "../utils/generate-id.js";
import { Role } from "@prisma/client";
import { logger } from "../application/logging.js";

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
        title: "Base",
        route: route,
        user: req.user,
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
            created_at: "desc",
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

    res.render("trip", {
        layout: "main-layout",
        title: "Trip",
        trips: tripsWithStatus,
        user: req.user,
    });
};

const checkpoint = async (req, res) => {
    // Mengambil data checkpoint dari database
    const checkpoints = await prisma.checkPoint.findMany();

    res.render("checkpoint", {
        layout: "main-layout",
        title: "Trip",
        checkpoints: checkpoints,
        user: req.user,
    });
};

const payment = async (req, res) => {
    const trips = await prisma.trip.findMany({
        include: {
            user: true,
            payment: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    res.render("payment", {
        layout: "main-layout",
        title: "Payment",
        trips: trips,
        user: req.user,
    });
};

const login = async (req, res, next) => {
    res.render("auth/login", {
        layout: "auth/auth-layout",
    });
};

const performLogin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            throw new WebError(400, result.error.message, "/admin/login");
        }

        const { email, password } = result.value;

        // Mengecek apakah email dan password sesuai
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new WebError(
                401,
                "Email atau password salah",
                "/admin/login"
            );
        }

        // Mengecek apakah password sesuai
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new WebError(
                401,
                "Email atau password salah",
                "/admin/login"
            );
        }

        res.cookie("admin_id", user.id);
        req.flash(`success", "Selamat datang, ${user.name}`);
        res.redirect("/admin/route");
    } catch (error) {
        next(error);
    }
};

const register = async (req, res) => {
    res.render("auth/register", {
        layout: "auth/auth-layout",
    });
};

const performRegister = async (req, res, next) => {
    try {
        const schema = Joi.object({
            national_id: Joi.string().max(30).required(),
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).required(),
            password_confirm: Joi.string().max(100).required(),
            name: Joi.string().max(100).required(),
            phone: Joi.string().max(20).required(),
            emergency_phone: Joi.string().max(20).required(),
            date_of_birth: Joi.date().required(),
            gender: Joi.string().required(),
            weight: Joi.number().required(),
            height: Joi.number().required(),
            address: Joi.string().max(255),
        });

        const validated = schema.validate(req.body);
        if (validated.error) {
            throw new WebError(400, validated.error.message, "/admin/register");
        }

        if (validated.value.password !== validated.value.password_confirm) {
            throw new WebError(
                400,
                "Password dan Konfirmasi Password tidak sama",
                "/admin/register"
            );
        }

        const hashedPassword = await bcrypt.hash(validated.value.password, 10);

        validated.value.password = hashedPassword;
        delete validated.value.password_confirm;
        validated.value.id = await generateUserId();
        validated.value.role = Role.ADMIN;

        const countExistEmail = await prisma.user.count({
            where: {
                email: validated.value.email,
            },
        });

        if (countExistEmail > 0) {
            throw new WebError(400, "Email sudah terdaftar", "/admin/register");
        }

        try {
            await prisma.user.create({
                data: validated.value,
            });
        } catch (error) {
            throw new WebError(
                500,
                "Terjadi Kesalahan saat melakukan pendaftaran",
                "/admin/register"
            );
        }

        req.flash("success", "Berhasil mendaftar");
        res.redirect("/admin/login");
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie("admin_id");
        req.flash("success", "Berhasil logout");
        res.redirect("/admin/login");
    } catch (error) {
        next(error);
    }
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
