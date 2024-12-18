import express from "express";
import adminController from "../controller/admin-controller.js";
import { adminMiddleware } from "../middleware/auth-middleware.js";

export const adminRouter = new express.Router();

adminRouter.get("/login", adminController.login);
adminRouter.post("/login", adminController.performLogin);
// adminRouter.get("/register", adminController.register);
// adminRouter.post("/register", adminController.performRegister);
adminRouter.get("/logout", adminController.logout);

adminRouter.use(adminMiddleware);

// ADMIN ROUTES
adminRouter.get("/users", adminController.users);
adminRouter.get("/users/add", adminController.addUser);
adminRouter.post("/users/store", adminController.storeUser);
adminRouter.get("/users/:id/edit", adminController.editUser);
adminRouter.post("/users/:id/update", adminController.updateUser);

adminRouter.get("/route", adminController.route);
adminRouter.get("/trip", adminController.trip);
adminRouter.get("/checkpoint", adminController.checkpoint);
adminRouter.get("/payment", adminController.payment);
adminRouter.get("/scan", adminController.showScan);
