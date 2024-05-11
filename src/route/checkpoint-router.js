import express from 'express';
import checkpointController from '../controller/checkpoint-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

export const checkpointRouter = new express.Router();   
checkpointRouter.use(authMiddleware);

checkpointRouter.get('/', checkpointController.list);

checkpointRouter.get('/:id', checkpointController.get);