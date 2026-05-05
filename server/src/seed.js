import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { connectDB } = await import("./lib/mongoose.js");
const { UserModel } = await import("./models/user.model.js");
const { EventModel } = await import("./models/event.model.js");
const { default: bcrypt } = await import("bcryptjs");

await connectDB();

async function seed() {
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
			consentVersion: null,
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
			consentVersion: null,
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
		await EventModel.create({
			title: "Seeded Event",
			price: 0,
			currency: "INR",
			location: "DELHI",
			category: "Social",
			imgUrls: [],
			description: "Its a Seeded mock event created by EMS for testing",
			date: new Date(),
			tags: [],
			capacity: 100,
			organizerId: user?._id,
			organizerEmail: userEmail,
			status: "PENDING",
		});

		console.log("Event created");
	}

	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
