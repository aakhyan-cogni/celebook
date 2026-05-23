import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model.js";
import { fromDoc } from "../models/util.js";
import { getCurrentTermsVersion } from "./consent.service.js";

export async function hashPassword(password) {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
	return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email) {
	const normalized = (email ?? "").trim().toLowerCase();
	const doc = await UserModel.findOne({ email: normalized }).lean();
	return fromDoc(doc);
}

export async function findUserById(userId) {
	const doc = await UserModel.findById(userId).lean();
	return fromDoc(doc);
}

export async function updateRefreshToken(userId, refreshToken) {
	const doc = await UserModel.findByIdAndUpdate(userId, { $set: { refreshToken } }, { new: true }).lean();
	return fromDoc(doc);
}

export async function validateRefreshToken(userId, refreshToken) {
	const doc = await UserModel.findById(userId).select("refreshToken").lean();
	return doc?.refreshToken === refreshToken;
}

export async function createUser(data) {
	const currentVersion = data.termsAccepted ? await getCurrentTermsVersion() : null;
	const created = await UserModel.create({
		email: (data.email ?? "").trim().toLowerCase(),
		password: data.password,
		name: data.name,
		role: "USER",
		tier: "FREE",
		consentAccepted: data.termsAccepted,
		consentAcceptedAt: data.termsAccepted ? new Date() : null,
		consentVersion: currentVersion,
	});

	return {
		id: created._id.toString(),
		email: created.email,
		name: created.name,
		role: "USER",
		consentAccepted: created.consentAccepted,
		consentVersion: currentVersion,
	};
}
