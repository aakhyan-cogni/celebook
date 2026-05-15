import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
	authRouter,
	consentRouter,
	eventRouter,
	userRouter,
	adminRouter,
	registrationRouter,
	notificationRouter,
} from "./routes/index.js";

const app = express();

app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/consent", consentRouter);
app.use("/api/admin", adminRouter);

// Global error handler
app.use((err, req, res, next) => {
	console.error("Global error handler:", err);
	res.status(500).json({ message: "Internal server error" });
});

export default app;
