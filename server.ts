import express from 'express';
import type { Request, Response } from 'express';
import { connectDB } from './db/db.connect.js';
const app = express();

connectDB();
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
