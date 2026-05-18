import { RegistrationModel, EventModel, EventStatModel } from "../models/index.js";
import { generateTicketToken, verifyTicketToken } from "../lib/jwt.js";
import mongoose from "mongoose";
import { createNotification } from "./notification.service.js";

export async function registerForEvent(eventId, userId) {
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
		// Reactivate an existing CANCELLED row if present (the unique (eventId, userId)
		// index would otherwise reject a fresh create), else insert a new one.
		const existing = await RegistrationModel.findOne({
			eventId: new mongoose.Types.ObjectId(eventId),
			userId: new mongoose.Types.ObjectId(userId),
		});

		let registration;
		if (existing) {
			if (existing.status === "CONFIRMED") {
				const duplicateError = new Error("ALREADY_REGISTERED");
				duplicateError.code = "ALREADY_REGISTERED";
				throw duplicateError;
			}
			existing.status = "CONFIRMED";
			existing.registeredAt = new Date();
			registration = await existing.save();
		} else {
			registration = await RegistrationModel.create({
				eventId: new mongoose.Types.ObjectId(eventId),
				userId: new mongoose.Types.ObjectId(userId),
				status: "CONFIRMED",
			});
		}

		// Upsert EventStat — track attendee
		await EventStatModel.findOneAndUpdate(
			{ eventId: new mongoose.Types.ObjectId(eventId) },
			{ $addToSet: { attendees: new mongoose.Types.ObjectId(userId) } },
			{ upsert: true },
		);

		// Create + push notification to the user (DB + socket)
		await createNotification({
			userId,
			type: "REGISTRATION_CONFIRMED",
			data: {
				eventTitle: event.title,
				eventId: eventId.toString(),
				registrationId: registration._id.toString(),
			},
		});

		// Notify organizer on every 10% capacity milestone (10, 20, 30… of capacity)
		const step = Math.floor(event.capacity / 10);
		if (step >= 1) {
			const bookedCount = await RegistrationModel.countDocuments({
				eventId: new mongoose.Types.ObjectId(eventId),
				status: "CONFIRMED",
			});
			if (bookedCount > 0 && bookedCount % step === 0) {
				await createNotification({
					userId: event.organizerId,
					type: "REGISTRATION_MILESTONE",
					data: {
						eventTitle: event.title,
						eventId: eventId.toString(),
						bookedCount,
						capacity: event.capacity,
					},
				});
			}
		}

		// Populate and return
		const populatedRegistration = await registration.populate([{ path: "eventId" }, { path: "userId" }]);

		return { registration: populatedRegistration, event };
	} catch (error) {
		if (error.code === "ALREADY_REGISTERED") throw error;
		// Defensive: race could still produce a duplicate-key error
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

	// Cancelled attendees don't count toward stats — pull them from the EventStat
	await EventStatModel.updateOne(
		{ eventId: new mongoose.Types.ObjectId(eventId) },
		{ $pull: { attendees: new mongoose.Types.ObjectId(userId) } },
	);

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

export async function generateTicketTokenForRegistration(registrationId, requestingUserId) {
	const registration = await RegistrationModel.findById(registrationId);

	if (!registration) {
		const error = new Error("Registration not found");
		error.code = "REGISTRATION_NOT_FOUND";
		throw error;
	}

	if (registration.userId.toString() !== requestingUserId) {
		const error = new Error("Forbidden");
		error.code = "FORBIDDEN";
		throw error;
	}

	if (registration.status !== "CONFIRMED") {
		const error = new Error("Registration is not confirmed");
		error.code = "REGISTRATION_NOT_CONFIRMED";
		throw error;
	}

	const token = generateTicketToken({
		registrationId: registration._id.toString(),
		eventId: registration.eventId.toString(),
		userId: registration.userId.toString(),
	});

	return { token };
}

export async function checkInAttendee(rawToken, eventId, confirm) {
	let payload;
	try {
		payload = verifyTicketToken(rawToken);
	} catch {
		const error = new Error("Invalid or expired ticket token");
		error.code = "INVALID_TOKEN";
		throw error;
	}

	if (payload.eventId !== eventId) {
		const error = new Error("Token does not belong to this event");
		error.code = "TOKEN_EVENT_MISMATCH";
		throw error;
	}

	const registration = await RegistrationModel.findById(payload.registrationId).populate({
		path: "userId",
		select: "name email avatar",
	});

	if (!registration) {
		const error = new Error("Registration not found");
		error.code = "REGISTRATION_NOT_FOUND";
		throw error;
	}

	const alreadyPresent = registration.attendanceStatus === "PRESENT";

	if (confirm && !alreadyPresent) {
		registration.attendanceStatus = "PRESENT";
		registration.checkedInAt = new Date();
		await registration.save();
	}

	return { alreadyPresent, registration };
}
