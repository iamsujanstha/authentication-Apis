import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("Please provide mongoDB url in .env file")
}

async function connectDB() {
  try {
    if (process.env.MONGODB_URL) await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB is connected!! ")
  }
  catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1)
  }
}

export default connectDB;