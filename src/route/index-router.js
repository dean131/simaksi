import express from 'express';

export const indexRouter = new express.Router();

indexRouter.get('/', async (req, res) => {
  res.send('<h1>HELLO CUYY</h1>');
});