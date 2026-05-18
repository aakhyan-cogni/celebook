import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./lib/mongoose.js";
import { initSocket } from "./lib/socket.js";
import { PORT } from "./config/constants.js";
import { sendDueFeedbackReminders } from "./services/notification.service.js";

const FEEDBACK_SWEEP_INTERVAL_MS = 60 * 1000; // sweep every minute

connectDB()
	.then(() => {
		const httpServer = http.createServer(app);
		initSocket(httpServer);
		httpServer.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}`);
		});

		setInterval(() => {
			sendDueFeedbackReminders().catch((err) =>
				console.error("[feedback-reminder sweep] failed:", err),
			);
		}, FEEDBACK_SWEEP_INTERVAL_MS);
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1);
	});
