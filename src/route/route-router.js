import express from "express";
import routeController from "../controller/route-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

export const routeRouter = new express.Router();
routeRouter.use(authMiddleware);

routeRouter.get("/", routeController.list);

routeRouter.put("/:id/", routeController.update);
