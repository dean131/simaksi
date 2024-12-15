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
    res.render("trip", {
        layout: "main-layout",
        title: "Trip",
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
    // const trips = await prisma.trip.findMany({
    //     include: {
    //         user: true,
    //         payment: true,
    //     },
    //     orderBy: {
    //         created_at: "desc",
    //     },
    // });

    res.render("payment", {
        layout: "main-layout",
        title: "Payment",
        // trips: trips,
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

        // Redirect to Route page if user is SUPER_ADMIN
        if (user.role === Role.SUPER_ADMIN) {
            res.redirect("/admin/route");
        } else {
            res.redirect("/admin/trip");
        }
    } catch (error) {
        next(error);
    }
};

const showScan = async (req, res) => {
    res.render("scan", {
        layout: "main-layout",
        title: "Scan",
        user: req.user,
    });
};

const users = async (req, res) => {
    const users = await prisma.user.findMany();

    res.render("user/index", {
        layout: "main-layout",
        title: "Users",
        user: req.user,
    });
};

const addUser = async (req, res) => {
    res.render("user/add", {
        layout: "main-layout",
        title: "Add User",
        user: req.user,
    });
};

const storeUser = async (req, res, next) => {
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
            throw new WebError(
                400,
                validated.error.message,
                "/admin/users/add"
            );
        }

        if (validated.value.password !== validated.value.password_confirm) {
            throw new WebError(
                400,
                "Password dan Konfirmasi Password tidak sama",
                "/admin/users/add"
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
            throw new WebError(
                400,
                "Email sudah terdaftar",
                "/admin/users/add"
            );
        }

        // Handling national_id existence
        const countExistNationalId = await prisma.user.count({
            where: {
                national_id: validated.value.national_id,
            },
        });

        if (countExistNationalId > 0) {
            throw new WebError(400, "NIK sudah terdaftar", "/admin/users/add");
        }

        try {
            await prisma.user.create({
                data: validated.value,
            });
        } catch (error) {
            throw new WebError(
                500,
                "Terjadi Kesalahan saat melakukan pendaftaran",
                "/admin/users/add"
            );
        }

        req.flash("success", "Berhasil menambahkan user");
        res.redirect("/admin/users");
    } catch (error) {
        next(error);
    }
};

const editUser = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findFirst({
        where: {
            id: id,
        },
    });
    res.render("user/edit", {
        layout: "main-layout",
        title: "Edit User",
        editUser: user,
        user: req.user,
    });
};

const updateUser = async (req, res, next) => {
    try {
        // Mengambil id user dari request params
        const id = parseInt(req.params.id);

        // Validasi data yang diterima dari client
        const schema = Joi.object({
            national_id: Joi.string().max(30).required(),
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).allow(null, ""),
            password_confirm: Joi.string().max(100).allow(null, ""),
            name: Joi.string().max(100).required(),
            phone: Joi.string().max(20).required(),
            emergency_phone: Joi.string().max(20).required(),
            date_of_birth: Joi.date().required(),
            gender: Joi.string().required(),
            weight: Joi.number().required(),
            height: Joi.number().required(),
            address: Joi.string().max(255),
        });

        // Validasi data yang diterima dari client
        const result = schema.validate(req.body);
        if (result.error) {
            throw new WebError(
                400,
                result.error.message,
                `/admin/users/${id}/edit`
            );
        }

        // Mencari user berdasarkan id
        const isUserExist = await prisma.user.findFirst({
            where: {
                id: id,
            },
        });

        if (!isUserExist) {
            throw new WebError(404, "Pengguna tidak ditemukan", "/admin/users");
        }

        // Handling national_id update logic
        const isNationalIdExist = await prisma.user.findFirst({
            where: {
                national_id: result.value.national_id,
                id: {
                    not: id,
                },
            },
        });

        if (isNationalIdExist) {
            throw new WebError(
                400,
                "NIK sudah terdaftar",
                `/admin/users/${id}/edit`
            );
        }

        // Handling password update logic
        if (result.value.password) {
            if (result.value.password !== result.value.password_confirm) {
                throw new WebError(
                    400,
                    "Password dan password_confirm tidak sama",
                    `/admin/users/${id}/edit`
                );
            }

            // Encrypting password if provided
            result.value.password = await bcrypt.hash(
                result.value.password,
                10
            );
        } else {
            // Remove password field from update data if not provided
            delete result.value.password;
        }

        // Always remove password_confirm field
        delete result.value.password_confirm;

        // Update data user
        const user = await prisma.user.update({
            where: {
                id: id,
            },
            data: result.value,
        });

        // Menghapus password dari user object sebelum dikirim ke client
        delete user.password;

        req.flash("success", "Berhasil mengubah data user");
        res.redirect("/admin/users");
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
    users,
    addUser,
    editUser,
    storeUser,
    updateUser,

    trip,
    route,
    checkpoint,
    payment,
    login,
    performLogin,
    logout,
    // register,
    // performRegister,
    showScan,
};
