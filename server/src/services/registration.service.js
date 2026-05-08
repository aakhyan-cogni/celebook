import { RegistrationModel, EventModel } from "../models/index.js";
import mongoose from "mongoose";

const createNotification = async ({ userId, type, payload }) => {
	// TODO: Replace with actual notification service when available
	console.log("[Notification]", { userId, type, payload });
};

export async function registerForEvent(eventId, userId, formData = {}) {
	// Check event exists
	const event = await EventModel.findById(eventId);
	if (!event) {
		const error = new Error("Event not found");
		error.code = "EVENT_NOT_FOUND";
		throw error;
	}

	// Check event is APPROVED
	if (event.status !== "APPROVED") {
		const error = new Error("Event is not approved for registration");
		error.code = "EVENT_NOT_APPROVED";
		throw error;
	}

	// Check event is not cancelled
	if (event.isCancelled) {
		const error = new Error("Event has been cancelled");
		error.code = "EVENT_CANCELLED";
		throw error;
	}

	// Check event is not team event
	if (event.isTeamEvent) {
		const error = new Error("Cannot register directly for team events");
		error.code = "TEAM_EVENT";
		throw error;
	}

	// Check capacity not full
	const confirmedCount = await RegistrationModel.countDocuments({
		eventId: new mongoose.Types.ObjectId(eventId),
		status: "CONFIRMED",
	});

	if (confirmedCount >= event.capacity) {
		const error = new Error("Event is at full capacity");
		error.code = "EVENT_FULL";
		throw error;
	}

	try {
		// Create registration
		const registration = await RegistrationModel.create({
			eventId: new mongoose.Types.ObjectId(eventId),
			userId: new mongoose.Types.ObjectId(userId),
			status: "CONFIRMED",
			formData,
		});

		// Call createNotification
		await createNotification({
			userId,
			type: "REGISTRATION_CONFIRMED",
			payload: {
				eventId: eventId.toString(),
				registrationId: registration._id.toString(),
			},
		});

		// Populate and return
		const populatedRegistration = await registration.populate([{ path: "eventId" }, { path: "userId" }]);

		return { registration: populatedRegistration, event };
	} catch (error) {
		// Catch error 11000 (duplicate key)
		if (error.code === 11000) {
			const duplicateError = new Error("ALREADY_REGISTERED");
			duplicateError.code = "ALREADY_REGISTERED";
			throw duplicateError;
		}
		throw error;
	}
}

export async function cancelRegistration(eventId, userId) {
	// Find confirmed registration
	const registration = await RegistrationModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
		status: "CONFIRMED",
	});

	if (!registration) {
		const error = new Error("Registration not found");
		error.code = "REGISTRATION_NOT_FOUND";
		throw error;
	}

	// Get event to check date
	const event = await EventModel.findById(eventId);
	if (!event) {
		const error = new Error("Event not found");
		error.code = "EVENT_NOT_FOUND";
		throw error;
	}

	// Calculate hours until event
	const hoursUntilEvent = (event.date.getTime() - Date.now()) / (1000 * 60 * 60);

	// If < 24 hours, reject
	if (hoursUntilEvent < 24) {
		const error = new Error("TOO_LATE_TO_CANCEL");
		error.code = "TOO_LATE_TO_CANCEL";
		throw error;
	}

	// Set status to CANCELLED
	registration.status = "CANCELLED";
	await registration.save();

	return registration.populate([{ path: "eventId" }, { path: "userId" }]);
}

export async function getEventRegistrations(eventId) {
	// All confirmed registrations with userId populated (name, email, avatar)
	return RegistrationModel.find({
		eventId: new mongoose.Types.ObjectId(eventId),
		status: "CONFIRMED",
	}).populate({
		path: "userId",
		select: "name email avatar",
	});
}

export async function getMyRegistrations(userId) {
	// All registrations (all statuses) with eventId populated, sorted by registeredAt desc
	return RegistrationModel.find({
		userId: new mongoose.Types.ObjectId(userId),
	})
		.populate({
			path: "eventId",
		})
		.sort({ registeredAt: -1 });
}

export async function checkRegistration(eventId, userId) {
	// Returns registration doc if exists, or null
	return RegistrationModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
	});
}
