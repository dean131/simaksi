import { prisma } from "../application/prisma.js";

export const generateUserId = async () => {
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
};

export async function generateRandomTripId() {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    while (true) {
        let id = getRandomInt(100000, 999999);
        // Cek apakah id sudah digunakan
        const trip = await prisma.trip.findFirst({
            where: {
                id: id,
            },
        });
        if (!trip) {
            return parseInt(id);
        }
    }
}
