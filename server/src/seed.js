import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { connectDB } = await import("./lib/mongoose.js");
const { UserModel, EventModel, RegistrationModel, EventStatModel, NotificationModel, FeedbackModel } =
	await import("./models/index.js");
const { AppFeedbackModel } = await import("./models/appFeedback.model.js");
const { getOrCreateTermsConfig } = await import("./services/consent.service.js");
const { default: bcrypt } = await import("bcryptjs");

await connectDB();

const today = new Date();
const daysFromNow = (days) => {
	const d = new Date(today);
	d.setDate(d.getDate() + days);
	return d;
};
const hoursFromNow = (hours) => {
	const d = new Date(today);
	d.setHours(d.getHours() + hours);
	return d;
};

async function upsertUser({ email, password, name, role = "USER", tier = "FREE", profile = {} }, termsVersion) {
	const existing = await UserModel.findOne({ email });
	if (existing) {
		let changed = false;
		for (const [k, v] of Object.entries(profile)) {
			if (existing[k] == null && v != null) {
				existing[k] = v;
				changed = true;
			}
		}
		if (changed) await existing.save();
		return existing;
	}
	const hashed = await bcrypt.hash(password, 10);
	return UserModel.create({
		email,
		password: hashed,
		name,
		role,
		tier,
		avatar: profile.avatar ?? "default.png",
		consentAccepted: true,
		consentAcceptedAt: new Date(),
		consentVersion: termsVersion,
		refreshToken: null,
		...profile,
	});
}

async function ensureRegistration({ event, user, present = false }) {
	const existing = await RegistrationModel.findOne({ eventId: event._id, userId: user._id });
	const reg =
		existing ??
		(await RegistrationModel.create({
			eventId: event._id,
			userId: user._id,
			status: "CONFIRMED",
			registeredAt: daysFromNow(-1),
			attendanceStatus: present ? "PRESENT" : "PENDING",
			checkedInAt: present ? new Date(event.date) : null,
		}));

	if (present && reg.attendanceStatus !== "PRESENT") {
		reg.attendanceStatus = "PRESENT";
		reg.checkedInAt = new Date(event.date);
		await reg.save();
	}

	await EventStatModel.updateOne(
		{ eventId: event._id },
		{
			$addToSet: {
				registeredAttendees: user._id,
				...(present ? { presentAttendees: user._id } : {}),
			},
		},
		{ upsert: true },
	);

	return reg;
}

async function seed() {
	const terms = await getOrCreateTermsConfig();
	const termsVersion = terms.currentVersion;

	const adminEmail = process.env.ADMIN_EMAIL;
	const adminPassword = process.env.ADMIN_PASSWORD;
	const userEmail = process.env.USER_EMAIL;
	const userPassword = process.env.USER_PASSWORD;
	const organizerEmail = process.env.ORGANIZER_EMAIL;
	const organizerPassword = process.env.ORGANIZER_PASSWORD;
	if (!adminEmail || !adminPassword || !userEmail || !userPassword || !organizerEmail || !organizerPassword) {
		console.error("ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, USER_PASSWORD must be set in .env");
		process.exit(1);
	}

	const admin = await upsertUser(
		{
			email: adminEmail,
			password: adminPassword,
			name: "Admin",
			role: "ADMIN",
			tier: "ULTIMATE",
			profile: { avatar: "default.png" },
		},
		termsVersion,
	);
	console.log(`✓ Admin: ${admin.email}`);

	const user = await upsertUser(
		{
			email: userEmail,
			password: userPassword,
			name: "Demo User",
			role: "USER",
			tier: "FREE",
			profile: {
				avatar: "Male_1.jpeg",
				phoneNumber: "+91 98000 11111",
				dob: "1998-04-12",
				gender: "Male",
				country: "India",
				city: "Bengaluru",
				state: "Karnataka",
				zipcode: "560001",
				bio: "Loves discovering new tech meetups and weekend workshops.",
			},
		},
		termsVersion,
	);
	console.log(`✓ User: ${user.email}`);

	const organizer = await upsertUser(
		{
			email: organizerEmail,
			password: organizerPassword,
			name: "Priya Sharma",
			role: "USER",
			tier: "PRO",
			profile: {
				avatar: "Female_1.jpeg",
				phoneNumber: "+91 99887 76655",
				dob: "1990-09-23",
				gender: "Female",
				country: "India",
				city: "Mumbai",
				state: "Maharashtra",
				zipcode: "400001",
				orgName: "BrightStage Events",
				designation: "Founder & Lead Organizer",
				companyWebsite: "https://brightstage.example.com",
				bio: "Twelve years curating tech, music, and community events across India. Passionate about creating spaces where ideas meet people.",
			},
		},
		termsVersion,
	);
	console.log(`✓ Organizer: ${organizer.email}`);

	const attendees = [];
	const attendeeSpecs = [
		{ email: "rahul@ems.com", name: "Rahul Verma", avatar: "Male_2.jpeg", city: "Delhi" },
		{ email: "anita@ems.com", name: "Anita Iyer", avatar: "Female_2.jpeg", city: "Chennai" },
		{ email: "sameer@ems.com", name: "Sameer Khan", avatar: "Male_3.jpg", city: "Hyderabad" },
		{ email: "neha@ems.com", name: "Neha Kapoor", avatar: "Female_3.jpeg", city: "Pune" },
	];
	for (const spec of attendeeSpecs) {
		const att = await upsertUser(
			{
				email: spec.email,
				password: "1234",
				name: spec.name,
				role: "USER",
				tier: "FREE",
				profile: {
					avatar: spec.avatar,
					country: "India",
					city: spec.city,
				},
			},
			termsVersion,
		);
		attendees.push(att);
	}
	console.log(`✓ ${attendees.length} extra attendees`);

	const existingForOrganizer = await EventModel.findOne({ organizerId: organizer._id });

	const baseEvent = {
		currency: "INR",
		organizerId: organizer._id,
		organizerEmail: organizer.email,
		imgUrls: [],
		tags: [],
		isCancelled: false,
	};

	const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200`;
	const eventImages = {
		music: [IMG("1501386761578-eac5c94b800a"), IMG("1470229722913-7c0e2dbbafd3"), IMG("1493225457124-a3eb161ffa5f")],
		tech: [IMG("1517245386807-bb43f82c33c4"), IMG("1498050108023-c5249f4df085"), IMG("1461749280684-dccba630e2f6")],
		trail: [IMG("1571019613454-1cb2f99b2d8b"), IMG("1502784444187-359ac186c5bb")],
		pitch: [IMG("1556761175-5973dc0f32e7"), IMG("1505373877841-8d25f7d46678")],
		roundtable: [IMG("1517048676732-d65bc937f952")],
		hackathon: [IMG("1522071820081-009f0129c71c"), IMG("1515378791036-0648a3ef77b2")],
		photoWalk: [IMG("1524492412937-b28074a5d7da"), IMG("1514222709107-a180c68d72b4")],
		crypto: [IMG("1611974789855-9c2a0a7236a3"), IMG("1639762681485-074b7f938ba0")],
		comedy: [IMG("1527224538127-2104bb71c51b"), IMG("1531058020387-3be344556be6")],
	};

	const addHours = (date, hours) => new Date(new Date(date).getTime() + hours * 3600 * 1000);

	const draftStart = daysFromNow(21);
	const pendingStart = daysFromNow(10);
	const freeStart = daysFromNow(7);
	const paidStart = daysFromNow(14);
	const unlistedStart = daysFromNow(28);
	const hackathonStart = daysFromNow(35);
	const pastStart = daysFromNow(-5);
	const rejectedStart = daysFromNow(18);
	const cancelledStart = daysFromNow(4);
	const ongoingStart = hoursFromNow(-1);

	const eventSpecs = [
		{
			key: "draft",
			title: "[Draft] Indie Music Showcase",
			description: "An intimate evening of indie artists. Still being finalized — will be published soon.",
			category: "Music",
			tags: ["music", "indie", "live"],
			date: draftStart,
			endDate: addHours(draftStart, 3),
			location: "Mumbai, Maharashtra",
			price: 499,
			capacity: 150,
			status: "DRAFT",
			visibility: "PUBLIC",
			imgUrls: eventImages.music,
		},
		{
			key: "pending",
			title: "AI for Builders — Bengaluru Meetup",
			description:
				"Half-day workshop covering practical LLM tooling for product engineers. Talks, demos, and networking.",
			category: "Technology",
			tags: ["ai", "workshop", "developers"],
			date: pendingStart,
			endDate: addHours(pendingStart, 4),
			location: "Bengaluru, Karnataka",
			price: 0,
			capacity: 80,
			status: "PENDING",
			visibility: "PUBLIC",
			imgUrls: eventImages.tech,
		},
		{
			key: "ongoing",
			title: "Live Workshop — Design Systems in Practice",
			description:
				"Happening right now: a hands-on session on building a multi-brand design system. Drop-in friendly.",
			category: "Workshop",
			tags: ["design", "ongoing", "live"],
			date: ongoingStart,
			endDate: hoursFromNow(2),
			location: "Bengaluru, Karnataka",
			price: 0,
			capacity: 50,
			status: "APPROVED",
			visibility: "PUBLIC",
			imgUrls: eventImages.tech,
		},
		{
			key: "approved_free",
			title: "Weekend Trail Run — Sahyadri",
			description:
				"Group trail run through the Sahyadri ranges. Open to all fitness levels. Snacks and transport provided.",
			category: "Sports",
			tags: ["running", "outdoors", "weekend"],
			date: freeStart,
			endDate: addHours(freeStart, 5),
			location: "Lonavala, Maharashtra",
			price: 0,
			capacity: 60,
			status: "APPROVED",
			visibility: "PUBLIC",
			imgUrls: eventImages.trail,
		},
		{
			key: "approved_paid",
			title: "Startup Pitch Night",
			description: "Six pre-seed startups pitch to a panel of angel investors. Catered dinner included.",
			category: "Business",
			tags: ["startup", "pitch", "networking"],
			date: paidStart,
			endDate: addHours(paidStart, 4),
			location: "Mumbai, Maharashtra",
			price: 999,
			capacity: 120,
			status: "APPROVED",
			visibility: "PUBLIC",
			imgUrls: eventImages.pitch,
		},
		{
			key: "approved_unlisted",
			title: "VIP Investor Roundtable",
			description: "Invite-only roundtable. Accessible by direct link only — hidden from Explore.",
			category: "Business",
			tags: ["invite-only"],
			date: unlistedStart,
			endDate: addHours(unlistedStart, 2),
			location: "Mumbai, Maharashtra",
			price: 0,
			capacity: 20,
			status: "APPROVED",
			visibility: "UNLISTED",
			imgUrls: eventImages.roundtable,
		},
		{
			key: "hackathon",
			title: "InterCollege Hackathon 2026",
			description: "48-hour hackathon. Solo or grab teammates on-site. Single track, prizes for top three.",
			category: "Technology",
			tags: ["hackathon", "students"],
			date: hackathonStart,
			endDate: daysFromNow(37),
			location: "Pune, Maharashtra",
			price: 0,
			capacity: 200,
			status: "APPROVED",
			visibility: "PUBLIC",
			imgUrls: eventImages.hackathon,
		},
		{
			key: "past",
			title: "Photography Walk — Old Delhi",
			description: "A guided photo walk through Chandni Chowk and Jama Masjid. Cameras and phones welcome.",
			category: "Arts",
			tags: ["photography", "walk", "heritage"],
			date: pastStart,
			endDate: addHours(pastStart, 4),
			location: "Delhi",
			price: 299,
			capacity: 40,
			status: "APPROVED",
			visibility: "PUBLIC",
			hostFeedbackSentAt: daysFromNow(-4),
			imgUrls: eventImages.photoWalk,
		},
		{
			key: "rejected",
			title: "Crypto Pump Day [Rejected]",
			description: "Rejected by admin, see rejection reason.",
			category: "Business",
			tags: [],
			date: rejectedStart,
			endDate: addHours(rejectedStart, 6),
			location: "Bengaluru, Karnataka",
			price: 2999,
			capacity: 500,
			status: "REJECTED",
			visibility: "PUBLIC",
			rejectionReason:
				"Content violates community guidelines — speculative financial product promotion is not allowed.",
			imgUrls: eventImages.crypto,
		},
		{
			key: "cancelled",
			title: "Open Mic — The Comedy Cellar",
			description: "Stand-up open mic. Cancelled due to venue maintenance.",
			category: "Entertainment",
			tags: ["comedy", "open-mic"],
			date: cancelledStart,
			endDate: addHours(cancelledStart, 3),
			location: "Mumbai, Maharashtra",
			price: 0,
			capacity: 80,
			status: "APPROVED",
			visibility: "PUBLIC",
			isCancelled: true,
			cancelReason: "Venue closed for emergency maintenance. Refunds processed automatically.",
			imgUrls: eventImages.comedy,
		},
	];

	if (existingForOrganizer) {
		let updated = 0;
		for (const spec of eventSpecs) {
			const $set = {};
			if (spec.imgUrls?.length) $set.imgUrls = spec.imgUrls;
			if (spec.endDate) $set.endDate = spec.endDate;
			if (spec.category) $set.category = spec.category;
			if (Object.keys($set).length === 0) continue;
			const res = await EventModel.updateOne(
				{ organizerId: organizer._id, title: spec.title },
				{ $set },
			);
			if (res.modifiedCount) updated += res.modifiedCount;
		}
		const ongoingSpec = eventSpecs.find((s) => s.key === "ongoing");
		if (ongoingSpec) {
			const alreadyHave = await EventModel.findOne({
				organizerId: organizer._id,
				title: ongoingSpec.title,
			});
			if (!alreadyHave) {
				const { key, ...rest } = ongoingSpec;
				void key;
				await EventModel.create({ ...baseEvent, ...rest });
				updated += 1;
			} else {
				alreadyHave.date = ongoingSpec.date;
				alreadyHave.endDate = ongoingSpec.endDate;
				await alreadyHave.save();
				updated += 1;
			}
		}
		console.log(
			updated > 0
				? `✓ Synced ${updated} previously-seeded event(s).`
				: "Events for organizer already seeded — already in sync.",
		);
		process.exit(0);
	}

	const events = {};
	for (const spec of eventSpecs) {
		const { key, ...rest } = spec;
		events[key] = await EventModel.create({ ...baseEvent, ...rest });
	}
	console.log(`✓ ${Object.keys(events).length} events seeded`);

	await ensureRegistration({ event: events.approved_free, user });
	await ensureRegistration({ event: events.approved_paid, user });
	await ensureRegistration({ event: events.past, user, present: true });

	await ensureRegistration({ event: events.approved_free, user: attendees[0] });
	await ensureRegistration({ event: events.approved_free, user: attendees[1] });
	await ensureRegistration({ event: events.approved_paid, user: attendees[0] });
	await ensureRegistration({ event: events.past, user: attendees[0], present: true });
	await ensureRegistration({ event: events.past, user: attendees[1], present: true });
	await ensureRegistration({ event: events.past, user: attendees[2], present: false });
	await ensureRegistration({ event: events.hackathon, user: attendees[2] });
	await ensureRegistration({ event: events.hackathon, user: attendees[3] });
	console.log("✓ Registrations + EventStat seeded");

	await NotificationModel.deleteMany({ userId: user._id });
	await NotificationModel.insertMany([
		{
			userId: user._id,
			type: "REGISTRATION_CONFIRMED",
			title: "You're going!",
			message: `Your spot for "${events.approved_free.title}" is confirmed.`,
			data: { eventId: events.approved_free._id.toString() },
			read: false,
		},
		{
			userId: user._id,
			type: "EVENT_REMINDER",
			title: "Event in 7 days",
			message: `Reminder: "${events.approved_free.title}" is coming up.`,
			data: { eventId: events.approved_free._id.toString() },
			read: false,
			createdAt: hoursFromNow(-2),
		},
		{
			userId: user._id,
			type: "FEEDBACK_REMINDER",
			title: "Share your feedback",
			message: `How was "${events.past.title}"? Your feedback helps the organizer.`,
			data: { eventId: events.past._id.toString() },
			read: false,
			createdAt: hoursFromNow(-24),
		},
		{
			userId: user._id,
			type: "REGISTRATION_CONFIRMED",
			title: "Booking history",
			message: `You attended "${events.past.title}".`,
			data: { eventId: events.past._id.toString() },
			read: true,
			readAt: hoursFromNow(-12),
			createdAt: daysFromNow(-5),
		},
	]);
	console.log("✓ Notifications for user@ems.com");

	await NotificationModel.deleteMany({ userId: organizer._id });
	await NotificationModel.insertMany([
		{
			userId: organizer._id,
			type: "EVENT_SUBMITTED",
			title: "Submitted for review",
			message: `"${events.pending.title}" is awaiting admin approval.`,
			data: { eventId: events.pending._id.toString() },
			read: false,
		},
		{
			userId: organizer._id,
			type: "EVENT_REJECTED",
			title: "Event rejected",
			message: `"${events.rejected.title}" was rejected. Open it to see the reason.`,
			data: { eventId: events.rejected._id.toString() },
			read: false,
		},
		{
			userId: organizer._id,
			type: "REGISTRATION_MILESTONE",
			title: "10 registrations!",
			message: `Your event "${events.approved_free.title}" hit a milestone.`,
			data: { eventId: events.approved_free._id.toString() },
			read: true,
			readAt: hoursFromNow(-3),
		},
	]);
	console.log("✓ Notifications for organizer");

	const feedbackPayload = (overrides = {}) => ({
		eventId: events.past._id,
		overallRating: 4.5,
		worthAttending: 4.5,
		contentRelevance: 4,
		venueQuality: 4,
		punctuality: 4.5,
		facilitatorBehaviour: 5,
		wouldAttendAgain: true,
		areasOfImprovement: "More water stops along the trail route.",
		...overrides,
	});

	await FeedbackModel.deleteMany({ eventId: events.past._id });
	await FeedbackModel.insertMany([
		feedbackPayload({ userId: attendees[0]._id }),
		feedbackPayload({
			userId: attendees[1]._id,
			overallRating: 4,
			venueQuality: 3.5,
			areasOfImprovement: "Start time slipped by 20 minutes.",
		}),
	]);
	console.log("✓ Event feedback");

	await AppFeedbackModel.deleteMany({});
	await AppFeedbackModel.insertMany([
		{
			userId: user._id,
			rating: 5,
			message: "Booking flow is smooth and the QR ticket is a nice touch.",
		},
		{
			userId: attendees[1]._id,
			rating: 4,
			message: "Would love dark-mode polish on the event detail page.",
		},
		{
			userId: null,
			rating: 3,
			message: "Mobile nav feels cramped on smaller phones.",
		},
	]);
	console.log("✓ App feedback");

	console.log("\n🎉 Seed complete. Demo credentials:");
	console.log(`   admin     ${admin.email} / ${adminPassword}`);
	console.log(`   user      ${user.email} / ${userPassword}`);
	console.log(`   organizer ${organizer.email} / ${organizerPassword}`);
	console.log(`   attendees ${attendees.map((a) => a.email).join(", ")} (password 1234)`);
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
