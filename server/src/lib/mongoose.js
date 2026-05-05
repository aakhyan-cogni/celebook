import "dotenv/config";
import mongoose from "mongoose";

export async function connectDB() {
	const uri = process.env.DATABASE_URL;
	if (!uri) throw new Error("DATABASE_URL environment variable is required");
	await mongoose.connect(uri);
	console.log("Connected to MongoDB via Mongoose");
}

export default mongoose;
