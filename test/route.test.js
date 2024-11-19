import supertest from "supertest";
import { app } from "../src/application/main.js";
import { prisma } from "../src/application/prisma.js";
import { createTestUser, removeTestUser } from "./test-util.js";

describe("PUT /api/routes/:id", function () {
    let routeId;

    beforeAll(async () => {
        await createTestUser();

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
        await removeTestUser();

        await prisma.route.deleteMany({
            where: {
                name: "Updated Route",
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
        expect(response.body.data).toEqual({
            id: routeId,
            name: "Updated Route",
            price: 150,
            is_open: false,
        });
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

describe("GET /api/routes", function () {
    beforeAll(async () => {
        await createTestUser();
    });

    afterAll(async () => {
        await removeTestUser();
    });

    test("get routes", async () => {
        const response = await supertest(app)
            .get("/api/routes")
            .set("Authorization", "1");

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("get routes with invalid token", async () => {
        const response = await supertest(app)
            .get("/api/routes")
            .set("Authorization", "2");

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined();
    });
});
