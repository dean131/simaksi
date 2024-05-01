import express from 'express';
import memberController from '../controller/member-controller.js';

export const memberRouter = new express.Router();

memberRouter.post('/', memberController.create);
memberRouter.get('/', memberController.list);
memberRouter.delete('/:id', memberController.remove);