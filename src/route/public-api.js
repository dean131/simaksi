import express from 'express';
import userController from '../controller/user-controller.js';

export const publicApi = new express.Router();

publicApi.post('/api/users/register', userController.register);
publicApi.post('/api/users/login', userController.login);
