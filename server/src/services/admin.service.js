import { UserModel } from "../models/user.model.js";
import { EventModel } from "../models/event.model.js";
import { fromDoc } from "../models/util.js";

export async function getPaginatedUsers(page, limit, role) {
	const filter = role ? { role } : {};

	const docs = await UserModel.find(filter)
		.select("-password -refreshToken")
		.skip((page - 1) * limit)
		.limit(limit)
		.sort({updatedAt:-1})
		.lean();

	const total = await UserModel.countDocuments(filter);

	return {
		users: docs.map(fromDoc),
		total,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

export async function updateUserRole(userId, role) {
	const result = await UserModel.updateOne({ _id: userId }, { $set: { role } });
	return result.matchedCount > 0;
}

export async function getPaginatedEvents(page, limit, status) {
	const filter = status ? { status } : { status : {$ne:"DRAFT"}};

	const docs = await EventModel.find(filter)
		.skip((page - 1) * limit)
		.limit(limit)
		.sort({updatedAt:-1})
		.lean();

	const total = await EventModel.countDocuments(filter);

	return {
		events: docs.map(fromDoc),
		total,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

export async function approveEvent(eventId) {
	const result = await EventModel.updateOne({ _id: eventId }, { $set: { status: "APPROVED" } });
	return result.matchedCount > 0;
}

export async function rejectEvent(eventId, reason) {
	const result = await EventModel.updateOne(
		{ _id: eventId },
		{ $set: { status: "REJECTED", rejectionReason: reason } },
	);
	return result.matchedCount > 0;
}

export async function getStats() {
	const [totalUsers, totalEvents, pendingApprovals] = await Promise.all([
		UserModel.countDocuments(),
		EventModel.countDocuments(),
		EventModel.countDocuments({ status: "PENDING" }),
	]);

	return { totalUsers, totalEvents, pendingApprovals, totalRegistrations: 0 };
}
