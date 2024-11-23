import { prisma } from "../src/application/prisma.js";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

export const removeTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            name: "test",
        },
    });
};

export const createTestUser = async () => {
    return await prisma.user.create({
        data: {
            id: 1,
            national_id: "111111",
            email: "test@test.com",
            name: "test",
            password: await bcrypt.hash("test", 10),
            phone: "123456789",
            emergency_phone: "123456789",
            gender: "male",
            date_of_birth: new Date(),
            weight: 0,
            height: 0,
            role: Role.USER,
        },
    });
};

export const createTestRoute = async () => {
    return await prisma.route.create({
        data: {
            id: 1,
            name: "test",
            price: 10,
            is_open: true,
        },
    });
};

export const removeTestRoute = async () => {
    await prisma.route.deleteMany({
        where: {
            name: "test",
        },
    });
};
