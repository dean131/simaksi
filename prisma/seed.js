import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Seeder untuk User
    const users = await prisma.user.createMany({
        data: [
            {
                id: 1,
                national_id: "1234567890123456",
                email: "john.doe@example.com",
                name: "John Doe",
                password: "password123",
                phone: "081234567890",
                emergency_phone: "081298765432",
                gender: "Male",
                date_of_birth: new Date("1990-01-01"),
                weight: 70.5,
                height: 175.3,
                address: "123 Main St, Example City",
                role: "USER",
            },
            {
                id: 2,
                national_id: "6543210987654321",
                email: "jane.doe@example.com",
                name: "Jane Doe",
                password: "password123",
                phone: "081345678901",
                emergency_phone: "081298765432",
                gender: "Female",
                date_of_birth: new Date("1992-02-02"),
                weight: 60.0,
                height: 165.0,
                address: "456 Side St, Example City",
                role: "ADMIN",
            },
            {
                id: 3,
                national_id: "0987654321098765",
                email: "cuy@example.com",
                name: "Cuy",
                password: "password123",
                phone: "081234567890",
                emergency_phone: "081298765432",
                gender: "Female",
                date_of_birth: new Date("1992-02-02"),
                weight: 60.0,
                height: 165.0,
                address: "456 Side St, Example City",
                role: "USER",
            },
        ],
    });

    console.log(`Inserted ${users.count} users`);

    // Seeder untuk Route
    const routes = await prisma.route.createMany({
        data: [{ id: 1, name: "Route A", price: 100.0, is_open: true }],
    });

    console.log(`Inserted ${routes.count} routes`);

    // Seeder untuk Trip
    const trip = await prisma.trip.create({
        data: {
            start_date: new Date("2023-12-01"),
            end_date: new Date("2023-12-10"),
            route_id: 1, // ID dari route yang sudah dibuat
            user_id: 1, // ID dari user yang sudah dibuat
        },
    });

    console.log("Inserted 1 trip:", trip);

    // Seeder untuk Payment
    const payment = await prisma.payment.create({
        data: {
            status: "settlement",
            transaction_id: "TX1234567890",
            price: 100.0,
            expiration: new Date("2023-12-01T23:59:59"),
            bank: "bri",
            va_number: "123456789012",
            trip_id: trip.id,
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
