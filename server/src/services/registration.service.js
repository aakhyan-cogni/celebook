import { RegistrationModel, EventModel, EventStatModel } from "../models/index.js";
import { generateTicketToken, verifyTicketToken } from "../lib/jwt.js";
import mongoose from "mongoose";
import { createNotification } from "./notification.service.js";
import { computeEventTimeState } from "../lib/eventTime.js";

export async function registerForEvent(eventId, userId) {

	const event = await EventModel.findById(eventId);
	if (!event) {
		const error = new Error("Event not found");
		error.code = "EVENT_NOT_FOUND";
		throw error;
	}

	if (event.status !== "APPROVED") {
		const error = new Error("Event is not approved for registration");
		error.code = "EVENT_NOT_APPROVED";
		throw error;
	}

	if (event.isCancelled) {
		const error = new Error("Event has been cancelled");
		error.code = "EVENT_CANCELLED";
		throw error;
	}

	const timeState = computeEventTimeState(event);
	if (timeState === "ONGOING") {
		const error = new Error("Registration is closed — this event is already in progress");
		error.code = "EVENT_STARTED";
		throw error;
	}
	if (timeState === "FINISHED") {
		const error = new Error("This event has already taken place");
		error.code = "EVENT_PAST";
		throw error;
	}

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

		await EventStatModel.findOneAndUpdate(
			{ eventId: new mongoose.Types.ObjectId(eventId) },
			{ $addToSet: { registeredAttendees: new mongoose.Types.ObjectId(userId) } },
			{ upsert: true },
		);

		await createNotification({
			userId,
			type: "REGISTRATION_CONFIRMED",
			data: {
				eventTitle: event.title,
				eventId: eventId.toString(),
				registrationId: registration._id.toString(),
			},
		});

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

		const populatedRegistration = await registration.populate([{ path: "eventId" }, { path: "userId" }]);

		return { registration: populatedRegistration, event };
	} catch (error) {
		if (error.code === "ALREADY_REGISTERED") throw error;

		if (error.code === 11000) {
			const duplicateError = new Error("ALREADY_REGISTERED");
			duplicateError.code = "ALREADY_REGISTERED";
			throw duplicateError;
		}
		throw error;
	}
}

export async function cancelRegistration(eventId, userId) {

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

	const event = await EventModel.findById(eventId);
	if (!event) {
		const error = new Error("Event not found");
		error.code = "EVENT_NOT_FOUND";
		throw error;
	}

	const hoursUntilEvent = (event.date.getTime() - Date.now()) / (1000 * 60 * 60);

	if (hoursUntilEvent < 24) {
		const error = new Error(
			"Cancellations close 24 hours before the event starts. You can no longer cancel this booking.",
		);
		error.code = "TOO_LATE_TO_CANCEL";
		throw error;
	}

	registration.status = "CANCELLED";
	await registration.save();

	await EventStatModel.updateOne(
		{ eventId: new mongoose.Types.ObjectId(eventId) },
		{ $pull: { registeredAttendees: new mongoose.Types.ObjectId(userId) } },
	);

	return registration.populate([{ path: "eventId" }, { path: "userId" }]);
}

export async function getEventRegistrations(eventId) {

	return RegistrationModel.find({
		eventId: new mongoose.Types.ObjectId(eventId),
		status: "CONFIRMED",
	}).populate({
		path: "userId",
		select: "name email avatar",
	});
}

export async function getMyRegistrations(userId) {

	return RegistrationModel.find({
		userId: new mongoose.Types.ObjectId(userId),
	})
		.populate({
			path: "eventId",
		})
		.sort({ registeredAt: -1 });
}

export async function checkRegistration(eventId, userId) {

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

		await EventStatModel.updateOne(
			{ eventId: registration.eventId },
			{ $addToSet: { presentAttendees: registration.userId._id } },
		);
	}

	return { alreadyPresent, registration };
}
