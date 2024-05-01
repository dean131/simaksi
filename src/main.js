import express from 'express';
import { userRouter } from './route/user-router.js';
import { indexRouter } from './route/index-router.js';
import { errorMiddleware } from './midleware/error-midleware.js';
import { publicApi } from './route/public-api.js';
import { tripRouter } from './route/trip-router.js';
import { memberRouter } from './route/member-router.js';

const app = express();

// MIDDLEWARE
app.use(express.json());

// ROUTES
app.use(publicApi);
app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/members', memberRouter);

// MIDLEWARE ERROR
app.use(errorMiddleware);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});