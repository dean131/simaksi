import express from "express";
import userContoller from "../controller/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

export const userRouter = new express.Router();
userRouter.use(authMiddleware);

userRouter.get("/:id", userContoller.get);
userRouter.put("/:id/", userContoller.update);

userRouter.post("/logout/", userContoller.logout);
