import { prisma } from "../application/prisma.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";
import { Role } from "@prisma/client";

async function generateRandomIntId() {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    while (true) {
        let id = getRandomInt(100000, 999999);
        // Cek apakah id sudah digunakan
        const user = await prisma.user.findFirst({
            where: {
                id: id,
            },
        });
        if (!user) {
            return parseInt(id);
        }
    }
}

const register = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
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
            role: Joi.string(),
        });
        // Validasi data yang diterima dari client
        const result = schema.validate(req.body);
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Validasi password dan password_confirm
        if (req.body.password !== req.body.password_confirm) {
            throw new ResponseError(
                400,
                "Password and password_confirm not match"
            );
        }
        // Menghapus password_confirm dari req.body
        delete result.value.password_confirm;
        // Mengecek apakah email dan national_id sudah terdaftar
        const countUser = await prisma.user.count({
            where: {
                OR: [
                    {
                        email: result.value.email,
                    },
                    {
                        national_id: result.value.national_id,
                    },
                ],
            },
        });
        // Jika email sudah terdaftar, maka kirimkan error
        if (countUser >= 1) {
            throw new ResponseError(400, "Email or national_id already exist");
        }
        // Mengenkripsi password
        result.value.password = await bcrypt.hash(result.value.password, 10);
        // Generate id user
        result.value.id = await generateRandomIntId();
        // Menyimpan data user ke database
        const user = await prisma.user.create({
            data: result.value,
        });
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({ data: user });
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
        const schema = Joi.object({
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).required(),
        });
        // Validasi data yang diterima dari client
        const result = schema.validate(req.body);
        // Jika validasi gagal, kirimkan error
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Mengecek apakah email dan password sesuai
        const user = await prisma.user.findUnique({
            where: {
                email: result.value.email,
            },
        });
        // Jika email tidak ditemukan, kirimkan error
        if (!user) {
            throw new ResponseError(401, "email or password wrong");
        }
        // Mengecek apakah password sesuai
        const isPasswordValid = await bcrypt.compare(
            result.value.password,
            user.password
        );
        if (!isPasswordValid) {
            throw new ResponseError(401, "email or password wrong");
        }
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({ data: user });
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // Mengirimkan pesan ke client
        res.json({ message: "Logout success" });
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        // Mengambil data id user dari request
        const id = req.params.id;
        // Mencari user berdasarkan id
        const user = await prisma.user.findFirst({
            where: {
                id: parseInt(id),
            },
        });
        // Jika user tidak ditemukan, kirimkan error
        if (!user) {
            throw new ResponseError(404, "User not found");
        }
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({ data: user });
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        // Mengambil id user dari request params
        const id = parseInt(req.params.id);
        // Validasi data yang diterima dari client
        const schema = Joi.object({
            national_id: Joi.string().max(30).required(),
            email: Joi.string().email().max(100).required(),
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
        // Jika validasi gagal, kirimkan error
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Mencari user berdasarkan id
        const isUserExist = await prisma.user.findFirst({
            where: {
                id: id,
            },
        });
        // Jika user tidak ditemukan, kirimkan error
        if (!isUserExist) {
            throw new ResponseError(404, "User not found");
        }
        // Update data user
        const user = await prisma.user.update({
            where: {
                id: id,
            },
            data: result.value,
        });
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({ data: user });
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
};

// Export controller
export default {
    get,
    update,
    register,
    login,
    logout,
};
