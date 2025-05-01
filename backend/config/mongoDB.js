import mongoose from "mongoose";
import dotenv from  "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://nalin7parihar:YYDNi5Vj90DGG3Y6@backenddb.35gsy.mongodb.net/SplitWise");
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
}

export default connectDB;