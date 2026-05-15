import { Server } from "socket.io";
import { verifyAccessToken } from "./jwt.js";

let io = null;

function userRoom(userId) {
	return `user:${userId}`;
}

export function initSocket(httpServer) {
	io = new Server(httpServer, {
		cors: {
			origin: "http://localhost:5173",
			credentials: true,
			methods: ["GET", "POST"],
		},
	});

	io.use((socket, next) => {
		try {
			const token =
				socket.handshake.auth?.token ||
				socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
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
			// rooms are cleaned up automatically by socket.io
		});
	});

	return io;
}

export function emitToUser(userId, event, payload) {
	if (!io || !userId) return;
	io.to(userRoom(userId.toString())).emit(event, payload);
}
