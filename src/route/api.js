import express from "express";
import checkpointController from "../controller/checkpoint-controller.js";
import userContoller from "../controller/user-controller.js";
import tripController from "../controller/trip-controller.js";
import memberController from "../controller/member-controller.js";
import routeController from "../controller/route-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

import { upload } from "../multer.js";

export const router = new express.Router();
router.use(authMiddleware);

// CHECKPOINT ROUTES
router.get("/api/checkpoints", checkpointController.list);
router.get("/api/checkpoints/:id", checkpointController.get);
router.post(
	"/api/checkpoints",
	upload.single("picture"),
	checkpointController.create
);
router.post(
	"/api/checkpoints/:id/update",
	upload.single("picture"),
	checkpointController.update
);
router.delete("/api/checkpoints/:id", checkpointController.remove);

// USER ROUTES
router.get("/api/users/:id", userContoller.get);
router.put("/api/users/:id/", userContoller.update);
router.post("/api/users/logout/", userContoller.logout);

// TRIP ROUTES
router.get("/api/trips", tripController.list);
router.get("/api/trips/:id", tripController.get);
router.post("/api/trips/", tripController.create);
router.post("/api/trips/:id/cancel/", tripController.cancel);
router.post("/api/trips/confirm-create/", tripController.confirmCreate);

// MEMBER ROUTES
router.get("/api/members", memberController.list);
router.post("/api/members", memberController.create);
router.delete("/api/members/:id/", memberController.remove);

// ROUTE ROUTES
router.get("/api/routes", routeController.list);
router.put("/api/routes/:id/", routeController.update);
