import dotenv from 'dotenv';
dotenv.config({ path: './.env' });  // Explicitly specifying the path

import express from  'express';
import cors from 'cors';
import http from "http";
import cookieParser from 'cookie-parser';
import connectDB from './config/mongoDB.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/user.route.js';
import expenseRouter from './routes/expense.route.js';
import friendRouter from './routes/friends.route.js';
import transactionRouter from './routes/transaction.route.js';
import groupRouter from './routes/group.route.js';

const app = express();
connectDB();
connectCloudinary();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(cors({
  origin: ['https://squarix-4pz36nomz-nalin7parihars-projects.vercel.app', 'https://squarix.vercel.app','http://localhost:3000'], // Add your new Vercel subdomain here
  credentials: true,  // If you need to send cookies or headers along with the request
}));

const server = http.createServer(app);
app.get("/",(req,res) => {
  console.log("Server is running");
})
app.use("/api/user", userRouter);
app.use("/api/expenses",expenseRouter);
app.use("/api/friends",friendRouter);
app.use("/api/transactions",transactionRouter);
app.use("/api/groups", groupRouter);

server.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
