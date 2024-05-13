import express from "express";
import adminController from "../controller/admin-controller.js";

export const adminRouter = new express.Router();

adminRouter.get("/", adminController.route);
adminRouter.get("/trip", adminController.trip);
adminRouter.get("/checkpoint", adminController.checkpoint);
