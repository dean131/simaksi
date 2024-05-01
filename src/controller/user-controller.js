import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import { ResponseError } from "../utils/response-error.js";

const register = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
        const registerUserValidation = Joi.object({
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).required(),
            name: Joi.string().max(100).required(),
            password: Joi.string().max(100).required(),
            nik: Joi.string().max(100).required(),
            phone: Joi.string().max(20).required(),
            emergency_phone: Joi.string().max(20).required(),
            date_of_birth: Joi.date().required(),
            weight: Joi.number().required(),
            height: Joi.number().required(),
            address: Joi.string().max(255).required()
        });
        // Validasi data yang diterima dari client
        const result = registerUserValidation.validate(req.body);
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Mengecek apakah email sudah terdaftar
        const countUser = await prisma.user.count({
            where: {
                email: result.value.email
            }
        });
        // Jika email sudah terdaftar, maka kirimkan error
        if (countUser === 1) {
            throw new ResponseError(400, "Email telah terdaftar");
        }
        // Mengenkripsi password
        result.value.password = await bcrypt.hash(result.value.password, 10);
        // Menyimpan data user ke database
        const user = await  prisma.user.create({
            data: result.value,
            select: {
                email: true,
                name: true
            }
        });
        // Mengirimkan data user ke client
        res.json({data: user});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
        const loginUserValidation = Joi.object({
            email: Joi.string().email().max(100).required(),
            password: Joi.string().max(100).required()
        });
        // Validasi data yang diterima dari client
        const result = loginUserValidation.validate(req.body);
        // Jika validasi gagal, kirimkan error
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Mengecek apakah email dan password sesuai
        const user = await prisma.user.findUnique({
            where: {
                email: result.value.email
            }
        });
        // Jika email tidak ditemukan, kirimkan error
        if (!user) {
            throw new ResponseError(401, "email or password wrong");
        }
        // Mengecek apakah password sesuai
        const isPasswordValid = await bcrypt.compare(result.value.password, user.password);
        if (!isPasswordValid) {
            throw new ResponseError(401, "email or password wrong");
        }
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({data: user});    

    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        // Mengirimkan pesan ke client
        res.json({message: "Logout success"});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const get = async (req, res, next) => {
    try {
        // Mengambil data id user dari request
        const id = req.params.id;
        // Mencari user berdasarkan id
        const user = await prisma.user.findFirst({
            where: {
                id: parseInt(id)
            }
        });
        // Jika user tidak ditemukan, kirimkan error
        if (!user) {
            throw new ResponseError(404, "User not found");
        }
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({data: user});
    } catch(error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

const update = async (req, res, next) => {
    try {
        // Validasi data yang diterima dari client
        const updateUserValidation = Joi.object({
            email: Joi.string().email().max(100).required(),
            name: Joi.string().max(100).required(),
            nik: Joi.string().max(100).required(),
            phone: Joi.string().max(20).required(),
            emergency_phone: Joi.string().max(20).required(),
            date_of_birth: Joi.date().required(),
            weight: Joi.number().required(),
            height: Joi.number().required(),
            address: Joi.string().max(255).required()
        });
        // Validasi data yang diterima dari client
        const result = updateUserValidation.validate(req.body);
        // Jika validasi gagal, kirimkan error
        if (result.error) {
            throw new ResponseError(400, result.error.message);
        }
        // Mengambil id user dari request params
        const id = parseInt(req.params.id);
        // Update data user
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: result.value
        });
        // Menghapus password dari user
        delete user.password;
        // Mengirimkan data user ke client
        res.json({data: user});
    } catch (error) {
        // Mengirimkan error ke middleware error handler
        next(error);
    }
}

// Export controller
export default {
    get,
    update,
    register,
    login,
    logout
}