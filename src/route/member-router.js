import express from 'express';
import memberController from '../controller/member-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

export const memberRouter = new express.Router();
memberRouter.use(authMiddleware);

memberRouter.post('/', memberController.create);
memberRouter.get('/', memberController.list);

memberRouter.delete('/:id', memberController.remove);