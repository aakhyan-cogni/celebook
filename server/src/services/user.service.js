import { UserModel } from "../models/user.model.js";
import { fromDoc } from "../models/util.js";

export async function getUserById(id) {
	const doc = await UserModel.findById(id).lean();

	if (!doc) return null;

	if (!doc.role || !doc.tier) {
		await UserModel.updateOne({ _id: doc._id }, { $set: { role: doc.role ?? "USER", tier: doc.tier ?? "FREE" } });
		doc.role = doc.role ?? "USER";
		doc.tier = doc.tier ?? "FREE";
	}

	return fromDoc(doc);
}

export async function updateUser(id, userData) {
	const { id: _ignored, ...rest } = userData;
	const doc = await UserModel.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean();
	const mapped = fromDoc(doc);
	if (!mapped) throw new Error(`User not found: ${id}`);
	return mapped;
}
