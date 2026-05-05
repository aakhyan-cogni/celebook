import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./lib/mongoose.js";
import { PORT } from "./config/constants.js";

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1);
	});
