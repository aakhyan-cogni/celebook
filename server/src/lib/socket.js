import { Server } from "socket.io";
import { verifyAccessToken } from "./jwt.js";

let io = null;

function userRoom(userId) {
	return `user:${userId}`;
}

export function initSocket(httpServer) {
	const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean);

	io = new Server(httpServer, {
		cors: {
			origin: allowedOrigins,
			credentials: true,
			methods: ["GET", "POST"],
		},
	});

	io.use((socket, next) => {
		try {
			const token =
				socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
			if (!token) return next(new Error("Unauthorized"));
			const decoded = verifyAccessToken(token);
			socket.userId = decoded.userId;
			next();
		} catch {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", (socket) => {
		socket.join(userRoom(socket.userId));
		socket.on("disconnect", () => {

		});
	});

	return io;
}

export function emitToUser(userId, event, payload) {
	if (!io || !userId) return;
	io.to(userRoom(userId.toString())).emit(event, payload);
}

export function emitToAll(event, payload) {
	if (!io) return;
	io.emit(event, payload);
}
