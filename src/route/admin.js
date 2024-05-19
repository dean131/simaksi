import express from "express";
import adminController from "../controller/admin-controller.js";
import { adminMiddleware } from "../middleware/auth-middleware.js";

export const adminRouter = new express.Router();

adminRouter.get("/login", adminController.login);
adminRouter.post("/login", adminController.performLogin);
adminRouter.get("/logout", adminController.logout);

adminRouter.use(adminMiddleware);

// ADMIN ROUTES
adminRouter.get("/route", adminController.route);
adminRouter.get("/trip", adminController.trip);
adminRouter.get("/checkpoint", adminController.checkpoint);
