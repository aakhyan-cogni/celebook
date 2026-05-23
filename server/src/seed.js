import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { connectDB } = await import("./lib/mongoose.js");
const {
	UserModel,
	EventModel,
	RegistrationModel,
	EventStatModel,
	NotificationModel,
	FeedbackModel,
} = await import("./models/index.js");
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
		// Backfill profile fields on re-seed so the demo data stays rich without resetting passwords.
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

	// Users
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

	// Extra attendees so organizer panels show realistic counts.
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

	// Events
	if (await EventModel.findOne({ organizerId: organizer._id })) {
		console.log("Events for organizer already seeded — skipping event/registration/notification creation.");
		process.exit(0);
	}

	const baseEvent = {
		currency: "INR",
		organizerId: organizer._id,
		organizerEmail: organizer.email,
		imgUrls: [],
		tags: [],
		isCancelled: false,
	};

	const eventSpecs = [
		{
			key: "draft",
			title: "[Draft] Indie Music Showcase",
			description: "An intimate evening of indie artists. Still being finalized — will be published soon.",
			category: "Music",
			tags: ["music", "indie", "live"],
			date: daysFromNow(21),
			location: "Mumbai, Maharashtra",
			price: 499,
			capacity: 150,
			status: "DRAFT",
			visibility: "PUBLIC",
		},
		{
			key: "pending",
			title: "AI for Builders — Bengaluru Meetup",
			description: "Half-day workshop covering practical LLM tooling for product engineers. Talks, demos, and networking.",
			category: "Technology",
			tags: ["ai", "workshop", "developers"],
			date: daysFromNow(10),
			location: "Bengaluru, Karnataka",
			price: 0,
			capacity: 80,
			status: "PENDING",
			visibility: "PUBLIC",
		},
		{
			key: "approved_free",
			title: "Weekend Trail Run — Sahyadri",
			description: "Group trail run through the Sahyadri ranges. Open to all fitness levels. Snacks and transport provided.",
			category: "Sports",
			tags: ["running", "outdoors", "weekend"],
			date: daysFromNow(7),
			location: "Lonavala, Maharashtra",
			price: 0,
			capacity: 60,
			status: "APPROVED",
			visibility: "PUBLIC",
		},
		{
			key: "approved_paid",
			title: "Startup Pitch Night",
			description: "Six pre-seed startups pitch to a panel of angel investors. Catered dinner included.",
			category: "Business",
			tags: ["startup", "pitch", "networking"],
			date: daysFromNow(14),
			location: "Mumbai, Maharashtra",
			price: 999,
			capacity: 120,
			status: "APPROVED",
			visibility: "PUBLIC",
		},
		{
			key: "approved_unlisted",
			title: "VIP Investor Roundtable",
			description: "Invite-only roundtable. Accessible by direct link only — hidden from Explore.",
			category: "Business",
			tags: ["invite-only"],
			date: daysFromNow(28),
			location: "Mumbai, Maharashtra",
			price: 0,
			capacity: 20,
			status: "APPROVED",
			visibility: "UNLISTED",
		},
		{
			key: "team",
			title: "InterCollege Hackathon 2026",
			description: "48-hour team hackathon. Teams of 2-4, single track, prizes for top three.",
			category: "Technology",
			tags: ["hackathon", "team", "students"],
			date: daysFromNow(35),
			endDate: daysFromNow(37),
			location: "Pune, Maharashtra",
			price: 0,
			capacity: 200,
			status: "APPROVED",
			visibility: "PUBLIC",
			isTeamEvent: true,
			minTeamSize: 2,
			maxTeamSize: 4,
			teamCapacityMode: "PER_TEAM",
		},
		{
			key: "past",
			title: "Photography Walk — Old Delhi",
			description: "A guided photo walk through Chandni Chowk and Jama Masjid. Cameras and phones welcome.",
			category: "Arts",
			tags: ["photography", "walk", "heritage"],
			date: daysFromNow(-5),
			location: "Delhi",
			price: 299,
			capacity: 40,
			status: "APPROVED",
			visibility: "PUBLIC",
			hostFeedbackSentAt: daysFromNow(-4),
		},
		{
			key: "rejected",
			title: "Crypto Pump Day [Rejected]",
			description: "Rejected by admin — see rejection reason.",
			category: "Business",
			tags: [],
			date: daysFromNow(18),
			location: "Bengaluru, Karnataka",
			price: 2999,
			capacity: 500,
			status: "REJECTED",
			visibility: "PUBLIC",
			rejectionReason: "Content violates community guidelines — speculative financial product promotion is not allowed.",
		},
		{
			key: "cancelled",
			title: "Open Mic — The Comedy Cellar",
			description: "Stand-up open mic. Cancelled due to venue maintenance.",
			category: "Entertainment",
			tags: ["comedy", "open-mic"],
			date: daysFromNow(4),
			location: "Mumbai, Maharashtra",
			price: 0,
			capacity: 80,
			status: "APPROVED",
			visibility: "PUBLIC",
			isCancelled: true,
			cancelReason: "Venue closed for emergency maintenance. Refunds processed automatically.",
		},
	];

	const events = {};
	for (const spec of eventSpecs) {
		const { key, ...rest } = spec;
		events[key] = await EventModel.create({ ...baseEvent, ...rest });
	}
	console.log(`✓ ${Object.keys(events).length} events seeded`);

	// Registrations + EventStat
	// user@ems.com registers for the upcoming approved free, approved paid, and past events.
	// They are marked PRESENT for the past event (so the feedback button unlocks).
	await ensureRegistration({ event: events.approved_free, user });
	await ensureRegistration({ event: events.approved_paid, user });
	await ensureRegistration({ event: events.past, user, present: true });

	// Extra attendees on the same events so organizer panel counts > 1.
	await ensureRegistration({ event: events.approved_free, user: attendees[0] });
	await ensureRegistration({ event: events.approved_free, user: attendees[1] });
	await ensureRegistration({ event: events.approved_paid, user: attendees[0] });
	await ensureRegistration({ event: events.past, user: attendees[0], present: true });
	await ensureRegistration({ event: events.past, user: attendees[1], present: true });
	await ensureRegistration({ event: events.past, user: attendees[2], present: false });
	await ensureRegistration({ event: events.team, user: attendees[2] });
	await ensureRegistration({ event: events.team, user: attendees[3] });
	console.log("✓ Registrations + EventStat seeded");

	// Notifications for user@ems.com
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

	// Notifications for organizer (event lifecycle)
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

	// Feedback on the past event (so FeedbackSummary populates)
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

	// App-level feedback
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
