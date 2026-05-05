import * as AuthService from "../services/auth.service.js";
import { generateTokens, verifyRefreshToken } from "../lib/jwt.js";
import { excludeFields } from "../lib/util.js";

export async function register(req, res) {
	try {
		const { email, password, name, termsAccepted } = req.body;

		if (!termsAccepted) {
			return res.status(400).json({ message: "You must accept the Terms and Conditions to register" });
		}

		const existingUser = await AuthService.findUserByEmail(email);
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await AuthService.hashPassword(password);
		const user = await AuthService.createUser({ email, password: hashedPassword, name, termsAccepted });

		const tokens = generateTokens(user);
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(201).json({
			message: "User registered successfully",
			accessToken: tokens.accessToken,
			user,
		});
	} catch (error) {
		console.error("[register] Error in Auth controller:", error);
		res.status(500).json({ message: "Error registering user" });
	}
}

export async function login(req, res) {
	try {
		const { email, password } = req.body;

		const user = await AuthService.findUserByEmail(email);
		if (!user) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const isPasswordValid = await AuthService.comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const tokens = generateTokens(user);
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(200).json({
			message: "Login successful",
			accessToken: tokens.accessToken,
			user: excludeFields(user, ["password", "refreshToken"]),
		});
	} catch (error) {
		console.error("[login] Error in Auth controller:", error);
		res.status(500).json({ message: "Error logging in" });
	}
}

export async function refresh(req, res) {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return res.status(401).json({ message: "Refresh token missing" });
		}

		const decoded = verifyRefreshToken(refreshToken);
		const isValid = await AuthService.validateRefreshToken(decoded.userId, refreshToken);

		if (!isValid) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}

		const user = await AuthService.findUserByEmail(decoded.email);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(200).json({ accessToken: tokens.accessToken });
	} catch (error) {
		res.status(403).json({ message: "Session Expired" });
	}
}

export async function logout(req, res) {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			try {
				const decoded = verifyRefreshToken(refreshToken);
				await AuthService.updateRefreshToken(decoded.userId, null);
			} catch (error) {
				console.debug("[logout] Invalid refresh token during logout:", error);
			}
		}

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("[logout] Error in Auth controller:", error);
		res.status(500).json({ message: "Error logging out" });
	}
}
