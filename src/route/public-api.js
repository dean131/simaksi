import express from "express";
import tripController from "../controller/trip-controller.js";

export const publicRouter = new express.Router();

publicRouter.get("/", (req, res) => {
	res.redirect("/admin/route");
});

// MIDTRANS NOTIFICATION
publicRouter.post("/payment-notification", tripController.paymentNotification);
