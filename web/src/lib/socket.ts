import { io, Socket } from "socket.io-client";
import { SERVER_ORIGIN } from "./api";

const SOCKET_URL = SERVER_ORIGIN;

let socket: Socket | null = null;
let currentToken: string | null = null;

export function connectSocket(token: string): Socket {

	if (socket && currentToken !== token) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}

	if (socket && socket.connected) {
		currentToken = token;
		return socket;
	}
	if (socket) {
		socket.auth = { token };
		currentToken = token;
		socket.connect();
		return socket;
	}
	socket = io(SOCKET_URL, {
		auth: { token },
		autoConnect: true,
		withCredentials: true,
		transports: ["websocket", "polling"],
	});
	currentToken = token;
	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
	currentToken = null;
}

export function getSocket(): Socket | null {
	return socket;
}
