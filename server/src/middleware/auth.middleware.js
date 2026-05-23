import { verifyAccessToken } from "../lib/jwt.js";

export async function authenticate(req, res, next) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = verifyAccessToken(token);

		req.user = decoded;
		next();
	} catch (error) {
		console.error("[authenticate] Error in auth middleware:", error);
		res.status(401).json({ message: "Invalid or expired token" });
	}
}

export function optionalAuthenticate(req, res, next) {
	try {
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			req.user = verifyAccessToken(token);
		}
	} catch {
		req.user = undefined;
	}
	next();
}

export function authorize(roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden: You do not have permission" });
		}
		next();
	};
}
