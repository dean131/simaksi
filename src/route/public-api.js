import express from 'express';
import userController from '../controller/user-controller.js';
import tripController from '../controller/trip-controller.js';

export const publicApi = new express.Router();

publicApi.post('/api/users/register', userController.register);
publicApi.post('/api/users/login', userController.login);
publicApi.post('/api/payment-notification', tripController.paymentNotification)
