import { motion } from "motion/react";
import { Link } from "react-router";

export default function Terms() {
	return (
		<div className="container py-5 mt-4">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="card border-0 shadow-lg rounded-4 p-4 p-md-5"
					>
						<div className="mb-4">
							<Link to="/" className="btn btn-link text-primary p-0 text-decoration-none small">
								← Back to Home
							</Link>
						</div>

						<h1 className="fw-bold display-6 mb-1">Terms &amp; Conditions</h1>
						<p className="text-muted small mb-5">Last updated: April 24, 2026</p>

						<section className="mb-4">
							<h5 className="fw-bold">1. Acceptance of Terms</h5>
							<p className="text-muted">
								By accessing and using EMS (Event Management System), you accept and agree to be bound
								by these Terms and Conditions. If you do not agree to these terms, please discontinue
								use of the service immediately.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">2. Use of the Service</h5>
							<p className="text-muted">
								EMS is provided for lawful event management purposes only. You agree not to use the
								service for any unlawful activity, to transmit harmful content, or to interfere with
								other users' access to the platform.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">3. Account Responsibility</h5>
							<p className="text-muted">
								You are responsible for maintaining the confidentiality of your account credentials and
								for all activities that occur under your account. Notify us immediately of any
								unauthorised use.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">4. Data Privacy</h5>
							<p className="text-muted">
								We collect and process personal data in accordance with our Privacy Policy. By using EMS
								you consent to our data practices as described therein. We do not sell your personal
								data to third parties.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">5. Event Content</h5>
							<p className="text-muted">
								You retain ownership of content you submit but grant EMS a non-exclusive, royalty-free
								licence to display event information on the platform. You must not post misleading,
								offensive, or illegal content.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">6. Payments &amp; Refunds</h5>
							<p className="text-muted">
								Ticket payments are processed securely. Refund eligibility is determined by the
								individual event organiser's policy as stated on each event page. EMS is not liable for
								organiser-issued refund disputes.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">7. Limitation of Liability</h5>
							<p className="text-muted">
								EMS and its affiliates shall not be liable for any indirect, incidental, or
								consequential damages arising from your use of the service, including but not limited to
								loss of data, revenue, or goodwill.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">8. Modifications to Terms</h5>
							<p className="text-muted">
								EMS reserves the right to update these Terms at any time. Continued use of the service
								after changes are published constitutes acceptance of the revised terms. You will be
								prompted to re-accept whenever a new version is released.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">9. Governing Law</h5>
							<p className="text-muted">
								These Terms are governed by the laws of India. Any disputes shall be subject to the
								exclusive jurisdiction of the courts of Hyderabad, Telangana.
							</p>
						</section>

						<section className="mb-4">
							<h5 className="fw-bold">10. Contact</h5>
							<p className="text-muted">
								For questions about these Terms, contact us at{" "}
								<a href="mailto:legal@celebookems.com">legal@celebookems.com</a>.
							</p>
						</section>

						<hr />
						<p className="text-muted small text-center mt-3">© 2026 CeleBook EMS. All rights reserved.</p>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
