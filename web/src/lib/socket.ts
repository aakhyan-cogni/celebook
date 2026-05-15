import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
	if (socket && socket.connected) return socket;
	if (socket) {
		socket.auth = { token };
		socket.connect();
		return socket;
	}
	socket = io(SOCKET_URL, {
		auth: { token },
		autoConnect: true,
		withCredentials: true,
		transports: ["websocket", "polling"],
	});
	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
}

export function getSocket(): Socket | null {
	return socket;
}
