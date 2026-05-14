import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { connectDB } = await import("./lib/mongoose.js");
const { UserModel } = await import("./models/user.model.js");
const { EventModel } = await import("./models/event.model.js");
const { getOrCreateTermsConfig } = await import("./services/consent.service.js");
const { default: bcrypt } = await import("bcryptjs");

const {getCurrentTermsVersion} = await import("./services/consent.service.js")

await connectDB();

async function seed() {
	// Ensure terms config exists and grab the current version for consent records.
	const terms = await getOrCreateTermsConfig();
	const currentTermsVersion = terms.currentVersion;

	// Admin seed
	const existingAdmin = await UserModel.findOne({ role: "ADMIN" }).lean();

	if (existingAdmin) {
		console.log("Admin already exists, skipping seed.");
	} else {
		const email = process.env.ADMIN_EMAIL;
		const password = process.env.ADMIN_PASSWORD;

		if (!email || !password) {
			console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
			process.exit(1);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await UserModel.create({
			email,
			password: hashedPassword,
			name: "Admin",
			avatar: "default.png",
			role: "ADMIN",
			tier: "ULTIMATE",
			consentAccepted: true,
			consentAcceptedAt: new Date(),
			consentVersion: currentTermsVersion,
			refreshToken: null,
		});

		console.log(`Admin user created: ${email}`);
	}

	// User seed
	const existingUser = await UserModel.findOne({ role: "USER" }).lean();

	if (existingUser) {
		console.log("User already exists, skipping seed.");
	}

	const userEmail = process.env.USER_EMAIL;
	const userPassword = process.env.USER_PASSWORD;

	if (!userEmail || !userPassword) {
		console.log("USER_EMAIL and USER_PASSWORD must be set in .env");
		process.exit(1);
	} else if (!existingUser) {
		const userHashPass = (await bcrypt.hash(userPassword, 10)) || "1234";

		await UserModel.create({
			email: userEmail,
			password: userHashPass,
			name: "User",
			avatar: "default.png",
			role: "USER",
			tier: "FREE",
			consentAccepted: true,
			consentAcceptedAt: new Date(),
			consentVersion: currentTermsVersion,
			refreshToken: null,
		});

		console.log("User created : ", userEmail);
	}

	// Event seed (uses the seeded USER as organizer)
	const user = await UserModel.findOne({ email: userEmail }).lean();

	const isEventSeeded = await EventModel.findOne({}).lean();

	if (isEventSeeded) {
		console.log("Events already exists !");
		process.exit(0);
	} else {
		const today = new Date();
		const daysFromNow = (days) => {
			const d = new Date(today);
			d.setDate(d.getDate() + days);
			return d;
		};

		const baseEvent = {
			price: 0,
			currency: "INR",
			location: "DELHI",
			category: "Social",
			imgUrls: [],
			tags: [],
			capacity: 100,
			organizerId: user?._id,
			organizerEmail: userEmail,
			visibility: "PUBLIC",
			isCancelled: false,
		};

		await EventModel.create([
			{
				...baseEvent,
				title: "Pending Seeded Event",
				description: "A pending event awaiting admin approval, 5 days ahead.",
				date: daysFromNow(5),
				status: "PENDING",
			},
			{
				...baseEvent,
				title: "Approved Seeded Event",
				description: "An approved upcoming event, 3 days ahead.",
				date: daysFromNow(3),
				status: "APPROVED",
			},
			{
				...baseEvent,
				title: "Past Seeded Event",
				description: "A past event, 3 days ago, for testing feedback flows.",
				date: daysFromNow(-3),
				status: "APPROVED",
			},
		]);

		console.log("3 events created (pending +5d, approved +3d, past -3d)");
	}

	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
