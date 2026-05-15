import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./lib/mongoose.js";
import { initSocket } from "./lib/socket.js";
import { PORT } from "./config/constants.js";

connectDB()
	.then(() => {
		const httpServer = http.createServer(app);
		initSocket(httpServer);
		httpServer.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1);
	});
