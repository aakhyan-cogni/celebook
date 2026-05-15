import mongoose from "mongoose";
import { EventModel, RegistrationModel, UserModel } from "../models/index.js";

const TIER_LIMITS = {
	FREE: 2,
	PRO: 10,
	ULTIMATE: Number.MAX_SAFE_INTEGER,
};

const EVENT_UPDATABLE_FIELDS = [
	"title",
	"description",
	"category",
	"tags",
	"date",
	"endDate",
	"location",
	"price",
	"capacity",
	"imgUrls",
	"visibility",
	"isTeamEvent",
	"minTeamSize",
	"maxTeamSize",
	"teamCapacityMode",
	"formSchemaId",
];

export const createEvent = async (organizerId, organizerEmail, data) => {
	const eventData = {
		...data,
		organizerId,
		organizerEmail,
		status: "DRAFT",
		rejectionReason: null,
		isCancelled: false,
		cancelReason: null,
	};

	return EventModel.create(eventData);
};

export const getAllEvents = async ({ q, category, location, dateFrom, dateTo, page = 1, limit = 20 }) => {
	const filter = {
		status: "APPROVED",
		visibility: { $in: ["PUBLIC", "UNLISTED"] },
		isCancelled: false,
	};

	if (q) {
		filter.$text = { $search: q };
	}

	if (category) {
		filter.category = category;
	}

	if (location) {
		filter.location = { $regex: location, $options: "i" };
	}

	if (dateFrom || dateTo) {
		filter.date = {};
		if (dateFrom) {
			filter.date.$gte = new Date(dateFrom);
		}
		if (dateTo) {
			filter.date.$lte = new Date(dateTo);
		}
	}

	const currentPage = Math.max(1, Number(page) || 1);
	const pageSize = Math.max(1, Number(limit) || 20);
	const skip = (currentPage - 1) * pageSize;

	const [events, total] = await Promise.all([
		EventModel.find(filter).skip(skip).limit(pageSize).lean(),
		EventModel.countDocuments(filter),
	]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	// TODO: Attach avgRating and totalRatings from Feedback collection once Feedback model is available.

	return {
		events,
		pagination: {
			total,
			page: currentPage,
			limit: pageSize,
			totalPages,
		},
	};
};

export const getEventById = async (eventId, requestingUser = null) => {
	const event = await EventModel.findById(eventId).lean();
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	const isAdmin = requestingUser?.role === "ADMIN";
	const isOrganizer = requestingUser?.userId === event.organizerId?.toString();

	if (event.visibility === "PRIVATE" && !isAdmin && !isOrganizer) {
		if (!requestingUser) {
			return { error: "UNAUTHORIZED" };
		}

		const confirmedCount = await RegistrationModel.countDocuments({
			eventId: new mongoose.Types.ObjectId(eventId),
			userId: new mongoose.Types.ObjectId(requestingUser.userId),
			status: "CONFIRMED",
		});

		if (confirmedCount === 0) {
			return { error: "FORBIDDEN" };
		}
	}

	if (event.status !== "APPROVED" && !isAdmin && !isOrganizer) {
		return { error: "FORBIDDEN" };
	}

	// Attach userRegistration so the frontend knows if the viewer is registered
	if (requestingUser?.userId) {
		const reg = await RegistrationModel.findOne({
			eventId: new mongoose.Types.ObjectId(eventId),
			userId: new mongoose.Types.ObjectId(requestingUser.userId),
			status: "CONFIRMED",
		}).lean();
		event.userRegistration = reg ?? null;
	}

	return { event };
};

export const countActiveEvents = async (organizerId) => {
	return EventModel.countDocuments({
		organizerId: new mongoose.Types.ObjectId(organizerId),
		status: { $in: ["PENDING", "APPROVED"] },
	});
};

export const publishEvent = async (eventId, organizerId, isAdmin = false) => {
	const event = await EventModel.findById(eventId);
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	if (!isAdmin && event.organizerId?.toString() !== organizerId) {
		return { error: "FORBIDDEN" };
	}

	if (!["DRAFT", "REJECTED"].includes(event.status)) {
		return { error: "NOT_PUBLISHABLE" };
	}

	const user = await UserModel.findById(organizerId).lean();
	if (!user) {
		return { error: "FORBIDDEN" };
	}

	const activeCount = await countActiveEvents(organizerId);
	const tierLimit = TIER_LIMITS[user.tier] ?? 0;
	if (activeCount >= tierLimit) {
		return { error: "TIER_LIMIT_EXCEEDED" };
	}

	// PUBLIC/UNLISTED always need admin review on every publish.
	// PRIVATE events skip review — they're not listed and only reach invited attendees.
	const nextStatus = event.visibility === "PRIVATE" ? "APPROVED" : "PENDING";
	event.status = nextStatus;
	event.rejectionReason = null;
	await event.save();

	return { event: event.toObject() };
};

export const updateEvent = async (eventId, organizerId, data, isAdmin = false) => {
	const event = await EventModel.findById(eventId);
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	if (!isAdmin && event.organizerId?.toString() !== organizerId) {
		return { error: "FORBIDDEN" };
	}

	if (!isAdmin && !["DRAFT", "REJECTED"].includes(event.status)) {
		return { error: "NOT_EDITABLE" };
	}

	// Block widening visibility on an APPROVED event: a PRIVATE event was approved without
	// admin review, so flipping it to PUBLIC/UNLISTED would let it go live unreviewed.
	// Organizer must unpublish (back to DRAFT) and republish to trigger review.
	if (
		event.status === "APPROVED" &&
		event.visibility === "PRIVATE" &&
		data.visibility !== undefined &&
		data.visibility !== "PRIVATE"
	) {
		return { error: "VISIBILITY_CHANGE_REQUIRES_REPUBLISH" };
	}

	const update = {};
	EVENT_UPDATABLE_FIELDS.forEach((field) => {
		if (data[field] !== undefined) {
			update[field] = data[field];
		}
	});

	const updatedEvent = await EventModel.findByIdAndUpdate(eventId, update, { new: true }).lean();
	return { event: updatedEvent };
};

export const deleteEvent = async (eventId, organizerId, isAdmin = false) => {
	const event = await EventModel.findById(eventId);
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	if (!isAdmin && event.organizerId?.toString() !== organizerId) {
		return { error: "FORBIDDEN" };
	}

	// Block delete if ANY registration exists (PENDING/CONFIRMED/CANCELLED) — even cancelled
	// registrations are an audit trail we don't want to lose by hard-deleting the parent event.
	const registrationCount = await RegistrationModel.countDocuments({
		eventId: new mongoose.Types.ObjectId(eventId),
	});

	if (registrationCount > 0) {
		return { error: "HAS_REGISTRATIONS" };
	}

	await EventModel.findByIdAndDelete(eventId);
	return { event };
};

export const cancelEvent = async (eventId, organizerId, reason, isAdmin = false) => {
	const event = await EventModel.findById(eventId);
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	if (!isAdmin && event.organizerId?.toString() !== organizerId) {
		return { error: "FORBIDDEN" };
	}

	event.isCancelled = true;
	event.cancelReason = reason || null;
	await event.save();

	return { event: event.toObject() };
};

export const duplicateEvent = async (eventId, organizerId, isAdmin = false) => {
	const event = await EventModel.findById(eventId).lean();
	if (!event) {
		return { error: "NOT_FOUND" };
	}

	if (!isAdmin && event.organizerId?.toString() !== organizerId) {
		return { error: "FORBIDDEN" };
	}

	const newDate = event.date ? new Date(event.date) : new Date();
	newDate.setDate(newDate.getDate() + 7);

	const duplicate = await EventModel.create({
		...event,
		_id: undefined,
		title: `${event.title} (Copy)`,
		status: "DRAFT",
		rejectionReason: null,
		imgUrls: [],
		isCancelled: false,
		cancelReason: null,
		date: newDate,
		createdAt: undefined,
		updatedAt: undefined,
	});

	return { event: duplicate.toObject() };
};

export const getMyEvents = async (organizerId) => {
	return EventModel.aggregate([
		{ $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
		{ $sort: { createdAt: -1 } },
		{
			$lookup: {
				from: RegistrationModel.collection.name,
				localField: "_id",
				foreignField: "eventId",
				as: "registrations",
			},
		},
		{ $addFields: { registrationCount: { $size: "$registrations" } } },
		{ $project: { registrations: 0 } },
	]).exec();
};
