import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const TICKET_SECRET = process.env.TICKET_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = Number(process.env.ACCESS_TOKEN_EXPIRY);
const REFRESH_TOKEN_EXPIRY = Number(process.env.REFRESH_TOKEN_EXPIRY);

export const generateRefreshToken = (payload) => {
	return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const generateAccessToken = (payload) => {
	return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token) => {
	return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
	return jwt.verify(token, REFRESH_SECRET);
};

export const generateTicketToken = (payload) => {
	return jwt.sign(payload, TICKET_SECRET, { expiresIn: "24h" });
};

export const verifyTicketToken = (token) => {
	return jwt.verify(token, TICKET_SECRET);
};

export const generateTokens = (user) => {
	const payload = {
		userId: user.id,
		email: user.email,
		role: user.role || "USER",
	};

	return {
		accessToken: generateAccessToken(payload),
		refreshToken: generateRefreshToken(payload),
	};
};