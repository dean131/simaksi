import express from 'express';
import tripController from '../controller/trip.controller.js';  
import { authMiddleware } from '../middleware/auth-middleware.js';

export const tripRouter = new express.Router();
tripRouter.use(authMiddleware)

tripRouter.post('/', tripController.create)
tripRouter.get('/', tripController.list)

tripRouter.get('/:id', tripController.get)
