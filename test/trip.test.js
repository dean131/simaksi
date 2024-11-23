// import supertest from "supertest";
// import app from "../src/application/main.js";
// import { prisma } from "../src/application/prisma.js";
// import {
//     createTestUser,
//     removeTestUser,
//     createTestRoute,
//     removeTestRoute,
// } from "./test-util.js";
// import { generateRandomTripId } from "../src/utils/generate-id.js";

// // model Trip {
// //     id             Int       @id
// //     start_date     DateTime?
// //     end_date       DateTime?
// //     checked_in_at  DateTime?
// //     checked_out_at DateTime?
// //     canceled_at    DateTime?
// //     created_at     DateTime?
// //     updated_at     DateTime  @updatedAt
// //     route_id       Int
// //     user_id        Int
// //     route          Route     @relation(fields: [route_id], references: [id])
// //     user           User      @relation(fields: [user_id], references: [id])
// //     members        Member[]
// //     payment        Payment?
// //   }

// describe("GET /api/trips", function () {
//     let user;
//     let tripId;
//     beforeAll(async () => {
//         tripId = await generateRandomTripId();
//         user = await createTestUser();
//         const route = await createTestRoute();
//         await prisma.trip.create({
//             data: {
//                 id: tripId,
//                 start_date: new Date(),
//                 end_date: new Date(),
//                 checked_in_at: new Date(),
//                 checked_out_at: new Date(),
//                 canceled_at: new Date(),
//                 route_id: route.id,
//                 user_id: user.id,
//             },
//         });
//     });

//     afterAll(async () => {
//         await prisma.trip.delete({
//             where: {
//                 user_id: user.id,
//             },
//         });
//         await removeTestRoute();
//         await removeTestUser();
//     });

//     test("It should respond with an array of trips", async () => {
//         const response = await supertest(app)
//             .set("Authorization", user.id.toString())
//             .get("/api/trips");
//     });
// });
