import supertest from "supertest";
import { app } from "../src/main.js";
import { removeTestUser, createTestUser } from "./test-util.js";
import { Role } from "@prisma/client";
import { logger } from "../src/application/logging.js";

describe("POST /api/users/register", function () {
    afterAll(async () => {
        await removeTestUser();
    });

    test("register new user", async () => {
        const response = await supertest(app).post("/api/users/register").send({
            national_id: "111111",
            email: "test@test.com",
            name: "test",
            password: "test",
            password_confirm: "test",
            phone: "123456789",
            emergency_phone: "123456789",
            gender: "male",
            date_of_birth: new Date(),
            weight: 0,
            height: 0,
            role: Role.USER,
        });

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.national_id).toBe("111111");
        expect(response.body.data.email).toBe("test@test.com");
        expect(response.body.data.name).toBe("test");
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.phone).toBe("123456789");
        expect(response.body.data.emergency_phone).toBe("123456789");
        expect(response.body.data.gender).toBe("male");
        expect(response.body.data.date_of_birth).toBeDefined();
        expect(response.body.data.weight).toBe(0);
        expect(response.body.data.height).toBe(0);
        expect(response.body.data.role).toBe(Role.USER);
    });

    test("register new user with same email", async () => {
        const response = await supertest(app).post("/api/users/register").send({
            national_id: "111111",
            email: "test@test.com",
            name: "test",
            password: "test",
            password_confirm: "test",
            phone: "123456789",
            emergency_phone: "123456789",
            gender: "male",
            date_of_birth: new Date(),
            weight: 0,
            height: 0,
            role: Role.USER,
        });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("register new user with same national_id", async () => {
        const response = await supertest(app).post("/api/users/register").send({
            national_id: "111111",
            email: "test2@test.com",
            name: "test",
            password: "test",
            password_confirm: "test",
            phone: "123456789",
            emergency_phone: "123456789",
            gender: "male",
            date_of_birth: new Date(),
            weight: 0,
            height: 0,
            role: Role.USER,
        });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});

describe("POST /api/users/login", function () {
    beforeAll(async () => {
        await createTestUser();
    });

    afterAll(async () => {
        await removeTestUser();
    });

    test("login", async () => {
        const response = await supertest(app).post("/api/users/login").send({
            email: "test@test.com",
            password: "test",
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("login with invalid credentials", async () => {
        const response = await supertest(app).post("/api/users/login").send({
            email: "",
            password: "",
        });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("login with invalid password", async () => {
        const response = await supertest(app).post("/api/users/login").send({
            email: "test@test.com",
            password: "wrong",
        });

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined();
    });

    test("login with invalid email", async () => {
        const response = await supertest(app).post("/api/users/login").send({
            email: "wrong@test.com",
            password: "test",
        });

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined();
    });
});

describe("POST /api/users/logout", function () {
    beforeAll(async () => {
        await createTestUser();
    });

    afterAll(async () => {
        await removeTestUser();
    });

    test("logout", async () => {
        const response = await supertest(app)
            .post("/api/users/logout")
            .set("Authorization", "1");

        logger.info({ API_RESPONSE: response.body });

        expect(response.status).toBe(200);
    });
});

describe("GET /api/users/1", function () {
    beforeAll(async () => {
        await createTestUser();
    });

    afterAll(async () => {
        await removeTestUser();
    });

    test("get user", async () => {
        const response = await supertest(app)
            .get("/api/users/1")
            .set("Authorization", "1");

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("get user with invalid id", async () => {
        const response = await supertest(app)
            .get("/api/users/2")
            .set("Authorization", "1");

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    });

    test("get user with invalid token", async () => {
        const response = await supertest(app)
            .get("/api/users/1")
            .set("Authorization", "2");

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined();
    });
});

describe("PATCH /api/users/1", function () {
    beforeAll(async () => {
        await createTestUser();
    });

    afterAll(async () => {
        await removeTestUser();
    });

    test("update user", async () => {
        const date = new Date();
        const response = await supertest(app)
            .put("/api/users/1")
            .set("Authorization", "1")
            .send({
                national_id: "123321",
                email: "testUpdate@test.com",
                name: "test",
                phone: "987654321",
                emergency_phone: "987654321",
                gender: "female",
                date_of_birth: date,
                weight: 1,
                height: 1,
                address: "test",
            });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({
            id: 1,
            national_id: "123321",
            email: "testUpdate@test.com",
            name: "test",
            phone: "987654321",
            emergency_phone: "987654321",
            gender: "female",
            date_of_birth: date.toISOString(),
            weight: 1,
            height: 1,
            address: "test",
            role: Role.USER,
        });
    });
});
