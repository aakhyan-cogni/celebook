import sanitizeHtml from "sanitize-html";
import { TermsConfigModel } from "../models/terms-config.model.js";
import { UserModel } from "../models/user.model.js";
import { DEFAULT_TERMS_VERSION } from "../config/constants.js";
import { emitToAll } from "../lib/socket.js";

const SANITIZE_OPTIONS = {
	allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "strong", "em", "u", "ul", "ol", "li", "a", "br", "hr", "blockquote"],
	allowedAttributes: { a: ["href", "title"] },
	allowedSchemes: ["http", "https", "mailto"],
};

// Ported once from the legacy hardcoded ConsentModal copy so a fresh DB has
// something to show before an admin opens the editor.
const SEED_CONTENT = `
<h6>1. Acceptance of Terms</h6>
<p>By accessing and using EMS (Event Management System), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please discontinue use of the service immediately.</p>
<h6>2. Use of the Service</h6>
<p>EMS is provided for lawful event management purposes only. You agree not to use the service for any unlawful activity, to transmit harmful content, or to interfere with other users' access to the platform.</p>
<h6>3. Account Responsibility</h6>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use.</p>
<h6>4. Data Privacy</h6>
<p>We collect and process personal data in accordance with our Privacy Policy. By using EMS you consent to our data practices as described therein. We do not sell your personal data to third parties.</p>
<h6>5. Event Content</h6>
<p>You retain ownership of content you submit but grant EMS a non-exclusive, royalty-free licence to display event information on the platform. You must not post misleading, offensive, or illegal content.</p>
<h6>6. Payments &amp; Refunds</h6>
<p>Ticket payments are processed securely. Refund eligibility is determined by the individual event organiser's policy as stated on each event page. EMS is not liable for organiser-issued refund disputes.</p>
<h6>7. Limitation of Liability</h6>
<p>EMS and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service, including but not limited to loss of data, revenue, or goodwill.</p>
<h6>8. Modifications to Terms</h6>
<p>EMS reserves the right to update these Terms at any time. Continued use of the service after changes are published constitutes acceptance of the revised terms. You will be prompted to re-accept whenever a new version is released.</p>
<h6>9. Governing Law</h6>
<p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Hyderabad, Telangana.</p>
<h6>10. Contact</h6>
<p>For questions about these Terms, contact us at <a href="mailto:legal@celebookems.com">legal@celebookems.com</a>.</p>
`.trim();

function toDto(doc) {
	return {
		id: doc._id.toString(),
		currentVersion: doc.currentVersion,
		content: doc.content ?? "",
		updatedAt: doc.updatedAt,
	};
}

export async function getOrCreateTermsConfig() {
	const existing = await TermsConfigModel.findOne({});
	if (existing) {
		// Backfill content for pre-existing rows that pre-date the content field.
		if (!existing.content) {
			existing.content = SEED_CONTENT;
			await existing.save();
		}
		return toDto(existing.toObject());
	}

	const created = await TermsConfigModel.create({
		currentVersion: DEFAULT_TERMS_VERSION,
		content: SEED_CONTENT,
	});
	return toDto(created.toObject());
}

export async function getCurrentTermsVersion() {
	const config = await getOrCreateTermsConfig();
	return config.currentVersion;
}

export async function getCurrentTerms() {
	const config = await getOrCreateTermsConfig();
	return {
		version: config.currentVersion,
		content: config.content,
		updatedAt: config.updatedAt,
	};
}

export async function updateTerms({ version, content, publisherUserId }) {
	const trimmedVersion = typeof version === "string" ? version.trim() : "";
	if (!trimmedVersion) {
		const err = new Error("Version is required");
		err.code = "VERSION_INVALID";
		throw err;
	}

	const existing = await TermsConfigModel.findOne({});
	if (existing && existing.currentVersion === trimmedVersion) {
		const err = new Error("New version must differ from current");
		err.code = "VERSION_UNCHANGED";
		throw err;
	}

	const sanitized = sanitizeHtml(typeof content === "string" ? content : "", SANITIZE_OPTIONS);

	const now = new Date();
	const updated = existing
		? await TermsConfigModel.findByIdAndUpdate(
				existing._id,
				{ $set: { currentVersion: trimmedVersion, content: sanitized } },
				{ new: true },
			)
		: await TermsConfigModel.create({ currentVersion: trimmedVersion, content: sanitized });

	if (publisherUserId) {
		await UserModel.findByIdAndUpdate(publisherUserId, {
			$set: {
				consentAccepted: true,
				consentAcceptedAt: now,
				consentVersion: trimmedVersion,
			},
		});
	}

	const dto = toDto(updated.toObject());

	// Broadcast to every connected client so already-logged-in users get prompted
	// immediately rather than at their next mutating action.
	emitToAll("terms:updated", { version: dto.currentVersion, updatedAt: dto.updatedAt });

	return { version: dto.currentVersion, content: dto.content, updatedAt: dto.updatedAt };
}

export async function acceptConsent(userId) {
	const currentVersion = await getCurrentTermsVersion();
	const now = new Date();
	const doc = await UserModel.findByIdAndUpdate(
		userId,
		{
			$set: {
				consentAccepted: true,
				consentAcceptedAt: now,
				consentVersion: currentVersion,
			},
		},
		{ new: true, select: "consentAccepted consentAcceptedAt consentVersion" },
	).lean();

	if (!doc) return null;
	return {
		id: doc._id.toString(),
		consentAccepted: doc.consentAccepted,
		consentAcceptedAt: doc.consentAcceptedAt ?? null,
		consentVersion: doc.consentVersion ?? null,
	};
}

export async function getConsentStatus(userId) {
	const [user, currentVersion] = await Promise.all([
		UserModel.findById(userId).select("consentAccepted consentVersion").lean(),
		getCurrentTermsVersion(),
	]);

	const accepted = Boolean(user?.consentAccepted);
	const userVersion = user?.consentVersion ?? null;
	const needsRenewal = !accepted || userVersion !== currentVersion;

	return { accepted, userVersion, currentVersion, needsRenewal };
}
