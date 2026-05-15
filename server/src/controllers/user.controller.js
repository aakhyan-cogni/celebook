import * as UserService from "../services/user.service.js";
import { excludeFields } from "../lib/util.js";

export async function getUserProfile(req, res) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const user = await UserService.getUserById(req.user.userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: excludeFields(user, ["password", "refreshToken"]) });
	} catch (error) {
		console.error("[getUserProfile] Error in User controller:", error);
		res.status(500).json({ message: "Error fetching user profile" });
	}
}

export const getUserProfileById = async(req,res) => {
	try {

		const user = await UserService.getUserById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(excludeFields(user, ["password", "refreshToken"]));
	} catch (error) {
		console.error("[getUserProfileById] Error in User controller:", error);
		res.status(500).json({ message: "Error fetching user profile" });
	}
}

export async function updateUser(req, res) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const { data } = req.body;
		const updatedUser = await UserService.updateUser(req.user.userId, data);
		res.json({
			message: "User profile updated successfully",
			user: excludeFields(updatedUser, ["password", "refreshToken"]),
		});
	} catch (error) {
		console.error("[updateUser] Error in User controller:", error);
		res.status(500).json({ message: "Error updating user profile" });
	}
}

export async function uploadAvatar(req, res) {
	try {
		if (!req.user) return res.status(401).json({ message: "User not authenticated" });

		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const filename = req.file.filename;

		await UserService.updateUser(req.user.userId, { avatar: filename });

		res.json({ avatarUrl: `/uploads/avatars/${filename}`, filename });
	} catch (error) {
		console.error("[uploadAvatar] Error:", error);
		res.status(500).json({ message: "Avatar upload failed" });
	}
}
