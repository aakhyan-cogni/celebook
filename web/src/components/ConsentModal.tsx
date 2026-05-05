import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { acceptConsent } from "../api/consent.api";
import { useAuthStore } from "../store/useAuthStore";

export default function ConsentModal() {
	const consentRequired = useAuthStore((s) => s.consentRequired);
	const setConsentRequired = useAuthStore((s) => s.setConsentRequired);
	const pendingRequest = useAuthStore((s) => s.pendingRequest);
	const setPendingRequest = useAuthStore((s) => s.setPendingRequest);

	const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
	const [isAccepting, setIsAccepting] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!consentRequired) return;
		const block = (e: KeyboardEvent) => {
			if (e.key === "Escape") e.preventDefault();
		};
		document.addEventListener("keydown", block, true);
		return () => document.removeEventListener("keydown", block, true);
	}, [consentRequired]);

	if (!consentRequired) return null;

	function handleScroll() {
		const el = scrollRef.current;
		if (!el) return;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
			setHasScrolledToBottom(true);
		}
	}

	async function handleAccept() {
		setIsAccepting(true);
		try {
			await acceptConsent();
			setConsentRequired(false);
			if (pendingRequest) {
				setPendingRequest(null);
				await pendingRequest();
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to accept Terms & Conditions. Please try again.");
		} finally {
			setIsAccepting(false);
		}
	}

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="consent-modal-title"
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				backgroundColor: "rgba(0,0,0,0.75)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
			}}
		>
			<div
				className="card shadow-lg border-0 rounded-4 bg-body"
				style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="card-header border-0 bg-primary text-white rounded-top-4 p-4">
					<h4 className="mb-0 fw-bold" id="consent-modal-title">
						Terms &amp; Conditions Update
					</h4>
					<p className="mb-0 small opacity-75 mt-1">
						Please read and accept our updated Terms &amp; Conditions to continue.
					</p>
				</div>

				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className="card-body overflow-auto p-4"
					style={{ flex: 1 }}
				>
					<h6 className="fw-bold">1. Acceptance of Terms</h6>
					<p className="text-muted small">
						By accessing and using EMS (Event Management System), you accept and agree to be bound by
						these Terms and Conditions. If you do not agree to these terms, please discontinue use of
						the service immediately.
					</p>

					<h6 className="fw-bold">2. Use of the Service</h6>
					<p className="text-muted small">
						EMS is provided for lawful event management purposes only. You agree not to use the
						service for any unlawful activity, to transmit harmful content, or to interfere with other
						users' access to the platform.
					</p>

					<h6 className="fw-bold">3. Account Responsibility</h6>
					<p className="text-muted small">
						You are responsible for maintaining the confidentiality of your account credentials and
						for all activities that occur under your account. Notify us immediately of any
						unauthorised use.
					</p>

					<h6 className="fw-bold">4. Data Privacy</h6>
					<p className="text-muted small">
						We collect and process personal data in accordance with our Privacy Policy. By using EMS
						you consent to our data practices as described therein. We do not sell your personal data
						to third parties.
					</p>

					<h6 className="fw-bold">5. Event Content</h6>
					<p className="text-muted small">
						You retain ownership of content you submit but grant EMS a non-exclusive, royalty-free
						licence to display event information on the platform. You must not post misleading,
						offensive, or illegal content.
					</p>

					<h6 className="fw-bold">6. Payments &amp; Refunds</h6>
					<p className="text-muted small">
						Ticket payments are processed securely. Refund eligibility is determined by the individual
						event organiser's policy as stated on each event page. EMS is not liable for
						organiser-issued refund disputes.
					</p>

					<h6 className="fw-bold">7. Limitation of Liability</h6>
					<p className="text-muted small">
						EMS and its affiliates shall not be liable for any indirect, incidental, or consequential
						damages arising from your use of the service, including but not limited to loss of data,
						revenue, or goodwill.
					</p>

					<h6 className="fw-bold">8. Modifications to Terms</h6>
					<p className="text-muted small">
						EMS reserves the right to update these Terms at any time. Continued use of the service
						after changes are published constitutes acceptance of the revised terms. You will be
						prompted to re-accept whenever a new version is released.
					</p>

					<h6 className="fw-bold">9. Governing Law</h6>
					<p className="text-muted small">
						These Terms are governed by the laws of India. Any disputes shall be subject to the
						exclusive jurisdiction of the courts of Hyderabad, Telangana.
					</p>

					<h6 className="fw-bold">10. Contact</h6>
					<p className="text-muted small">
						For questions about these Terms, contact us at{" "}
						<a href="mailto:legal@celebookems.com">legal@celebookems.com</a>.
					</p>
				</div>

				<div className="card-footer border-0 bg-body-tertiary rounded-bottom-4 p-4">
					{!hasScrolledToBottom && (
						<p className="text-muted small text-center mb-3">
							Scroll to the bottom to enable the Accept button.
						</p>
					)}
					<button
						onClick={handleAccept}
						disabled={!hasScrolledToBottom || isAccepting}
						className="btn btn-primary w-100 btn-lg rounded-pill shadow"
					>
						{isAccepting ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
								Saving...
							</>
						) : (
							"I Accept the Terms & Conditions"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
