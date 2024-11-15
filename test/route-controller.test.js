import supertest from "supertest";
import { app } from "../src/application/main.js";
import { prisma } from "../src/application/prisma.js";
import { createTestUser, removeTestUser } from "./test-util.js";

describe("PUT /api/routes/:id", function () {
    let routeId;

    beforeAll(async () => {
        // Create User
        await createTestUser();

        // Create a test route
        const route = await prisma.route.create({
            data: {
                name: "test",
                price: 100,
                is_open: true,
            },
        });
        routeId = route.id;
    });

    afterAll(async () => {
        // Remove the test user
        await removeTestUser();

        // Clean up the test route
        await prisma.route.deleteMany({
            where: {
                name: "test",
            },
        });
    });

    test("update route successfully", async () => {
        const response = await supertest(app)
            .put(`/api/routes/${routeId}`)
            .set("Authorization", "1")
            .send({
                name: "Updated Route",
                price: 150,
                is_open: false,
            });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBe("Updated Route");
        expect(response.body.data.price).toBe(150);
        expect(response.body.data.is_open).toBe(false);
    });

    test("update route with invalid data", async () => {
        const response = await supertest(app)
            .put(`/api/routes/${routeId}`)
            .set("Authorization", "1")
            .send({
                name: "",
                price: "invalid",
                is_open: "invalid",
            });

        console.log(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("update route with invalid id", async () => {
        const response = await supertest(app)
            .put(`/api/routes/999`)
            .set("Authorization", "1")
            .send({
                name: "Updated Route",
                price: 150,
                is_open: false,
            });

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    });
});
