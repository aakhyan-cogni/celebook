import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
const zipRegex = /^[A-Za-z0-9\s-]{3,12}$/;
const urlRegex = /^https?:\/\/[^\s]+\.[^\s]+$/i;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;

export const emailSchema = z
	.string()
	.trim()
	.min(1, "Email is required")
	.regex(emailRegex, "Enter a valid email address");

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(72, "Password is too long")
	.refine((v) => /[A-Za-z]/.test(v), "Must contain a letter")
	.refine((v) => /[0-9]/.test(v), "Must contain a number");

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name is too long")
		.regex(nameRegex, "Use letters, spaces, hyphens or apostrophes only"),
	email: emailSchema,
	password: passwordSchema,
	termsAccepted: z.literal(true, { message: "You must accept the Terms and Conditions" }),
});

// Event creation
export const eventStep1Schema = z.object({
	title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
	category: z.string().trim().min(1, "Pick a category"),
	description: z
		.string()
		.trim()
		.min(20, "Description must be at least 20 characters")
		.max(5000, "Description is too long"),
	imagesCount: z.number().int().min(1, "Add at least one image"),
});

export const eventStep2Schema = z
	.object({
		date: z.string().min(1, "Pick a date"),
		time: z.string().min(1, "Pick a start time"),
		location: z.string().trim().min(3, "Enter a location"),
	})
	.refine(
		(v) => {
			const dt = new Date(`${v.date}T${v.time}`);
			return !isNaN(dt.getTime()) && dt.getTime() > Date.now();
		},
		{ message: "Event must be in the future", path: ["date"] },
	);

export const eventStep3Schema = z.object({
	price: z.coerce.number().min(0, "Price cannot be negative").max(1_000_000, "Price is too high"),
	capacity: z.coerce
		.number()
		.int("Capacity must be a whole number")
		.min(1, "Capacity must be at least 1")
		.max(1_000_000, "Capacity is too high"),
});

// Profile
export const basicProfileSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "First name is required")
		.max(50, "First name is too long")
		.regex(nameRegex, "Use letters only"),
	lastName: z.string().trim().max(50, "Last name is too long").regex(nameRegex, "Use letters only").or(z.literal("")),
	email: emailSchema,
	phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").or(z.literal("")),
	dob: z
		.string()
		.refine((v) => !v || new Date(v).getTime() < Date.now(), "Date of birth must be in the past")
		.optional(),
	gender: z.string().optional(),
});

export const addressSchema = z.object({
	country: z.string().trim().max(60).optional().or(z.literal("")),
	state: z.string().trim().max(60).optional().or(z.literal("")),
	city: z.string().trim().max(60).optional().or(z.literal("")),
	zipcode: z.string().trim().regex(zipRegex, "Enter a valid zipcode").or(z.literal("")),
});

export const orgInfoSchema = z.object({
	organizationName: z.string().trim().max(100, "Too long").optional().or(z.literal("")),
	designation: z.string().trim().max(100, "Too long").optional().or(z.literal("")),
	companyWebsite: z.string().trim().regex(urlRegex, "Enter a valid URL (https://...)").or(z.literal("")),
	bio: z.string().trim().max(1000, "Bio must be 1000 characters or less").optional().or(z.literal("")),
});

// Feedback (simple)
export const feedbackFormSchema = z.object({
	rating: z.number().int().min(1, "Please select a rating").max(5),
	message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000, "Message is too long"),
});

// Post-event feedback (multi-rating)
export const postEventFeedbackSchema = z.object({
	overallRating: z.number().int().min(1, "Please rate overall experience").max(5),
	wouldAttendAgain: z.enum(["yes", "no"], { message: "Please choose Yes or No" }),
	comments: z.string().trim().max(2000, "Comments must be 2000 characters or less").optional().or(z.literal("")),
});

// Admin terms
export const termsSchema = z.object({
	version: z
		.string()
		.trim()
		.min(1, "Version is required")
		.regex(/^[0-9]+(\.[0-9]+){0,2}$/, "Use format like 1.0 or 1.2.3"),
	content: z.string().trim().min(20, "Content must be at least 20 characters"),
});

// Reject / cancel modal
export const rejectReasonSchema = z.object({
	reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(500, "Reason is too long"),
});

export const cancelReasonSchema = z.object({
	reason: z.string().trim().max(500, "Reason is too long").optional().or(z.literal("")),
});

// Support chat
export const chatMessageSchema = z.object({
	message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});
