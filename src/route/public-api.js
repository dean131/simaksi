import express from "express";
import userController from "../controller/user-controller.js";
import tripController from "../controller/trip-controller.js";
import adminController from "../controller/admin-controller.js";

export const publicRouter = new express.Router();

publicRouter.get("/", (req, res) => {
	res.redirect("/admin/route");
});

// MIDTRANS NOTIFICATION
publicRouter.post("/payment-notification", tripController.paymentNotification);
