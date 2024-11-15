import express from "express";
import checkpointController from "../controller/checkpoint-controller.js";
import userContoller from "../controller/user-controller.js";
import tripController from "../controller/trip-controller.js";
import memberController from "../controller/member-controller.js";
import routeController from "../controller/route-controller.js";
import { apiMiddleware } from "../middleware/auth-middleware.js";

import { upload } from "../application/multer.js";

export const router = new express.Router();

router.post("/users/register", userContoller.register);
router.post("/users/login", userContoller.login);

router.use(apiMiddleware);

// CHECKPOINT ROUTES
router.get("/checkpoints", checkpointController.list);
router.get("/checkpoints/:id", checkpointController.get);
router.post(
    "/checkpoints",
    upload.single("picture"),
    checkpointController.create
);
router.put(
    "/checkpoints/:id",
    upload.single("picture"),
    checkpointController.update
);
router.delete("/checkpoints/:id", checkpointController.remove);

// USER ROUTES
router.get("/users/:id", userContoller.get);
router.put("/users/:id", userContoller.update);
router.post("/users/logout", userContoller.logout);

// TRIP ROUTES
router.get("/trips", tripController.list);
router.get("/trips/:id", tripController.get);
router.get("/trips/:id/generate_pdf", tripController.generatePDF);
router.post("/trips", tripController.create);
router.post("/trips/:id/cancel", tripController.cancel);
router.post("/trips/:id/check-in", tripController.checkIn);
router.post("/trips/:id/check-out", tripController.checkOut);
router.post("/trips/confirm-create", tripController.confirmCreate);

// MEMBER ROUTES
router.get("/members", memberController.list);
router.post("/members", memberController.create);
router.delete("/members/:id", memberController.remove);

// ROUTE ROUTES
router.get("/routes", routeController.list);
router.put("/routes/:id", routeController.update);
