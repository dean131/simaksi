import express from "express";
import userController from "../controller/user-controller.js";
import adminController from "../controller/admin-controller.js";
import tripController from "../controller/trip-controller.js";

export const publicRouter = new express.Router();

publicRouter.get("/", (req, res) => {
	res.redirect("/admin/route");
});

// ADMIN ROUTES
publicRouter.get("/admin/route", adminController.route);
publicRouter.get("/admin/trip", adminController.trip);
publicRouter.get("/admin/checkpoint", adminController.checkpoint);

// CHECKPOINT ROUTES
publicRouter.post("/api/users/register/", userController.register);
publicRouter.post("/api/users/login/", userController.login);

// MIDTRANS NOTIFICATION
publicRouter.post(
	"/api/payment-notification/",
	tripController.paymentNotification
);
