import express from 'express';
import tripController from '../controller/trip.controller.js';  

export const tripRouter = new express.Router();

tripRouter.post('/', tripController.create)
tripRouter.get('/', tripController.list)
tripRouter.get('/:id', tripController.get)
