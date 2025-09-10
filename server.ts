import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './db/db.connect.js';
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import storeRoute from './routes/store.route.js'
import reviewRoute from './routes/review.route.js'
import dotenv from 'dotenv';
dotenv.config();
const app = express();

connectDB();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/store', storeRoute);
app.use('/api/v1/review', reviewRoute);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3004}`);
});
