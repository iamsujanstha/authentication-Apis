import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/connectDb';
import userRouter from './routes/user-routes';

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());
app.use(cookieParser());
// app.use(morgan());
app.use(helmet({ crossOriginResourcePolicy: false }));

// Register user routes before starting the server
app.use('/api', userRouter);

// Default route
app.get('/', (request, response) => {
  response.json({
    message: 'Server is running',
  });
});

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
  });
});
