import { Link } from "react-router";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-body-tertiary border-top mt-auto pt-5 pb-3">
			<div className="container">
				<div className="row gy-4">
					<div className="col-12 col-md-4">
						<Link to="/" className="d-inline-flex align-items-center text-decoration-none text-body">
							<span className="fw-bold fs-4 text-primary">CeleBook</span>
							<span className="ms-2 badge bg-primary-subtle text-primary-emphasis rounded-pill small">
								EMS
							</span>
						</Link>
						<p className="text-muted small mt-3 mb-0" style={{ maxWidth: 280 }}>
							Event management made simple — discover, host, and celebrate every moment.
						</p>
					</div>

					<div className="col-6 col-md-2">
						<h6 className="fw-bold text-uppercase small mb-3">Product</h6>
						<ul className="list-unstyled small mb-0">
							<li className="mb-2">
								<Link to="/events" className="text-muted text-decoration-none">
									Browse Events
								</Link>
							</li>
							<li className="mb-2">
								<Link to="/create" className="text-muted text-decoration-none">
									Create Event
								</Link>
							</li>
							<li className="mb-2">
								<Link to="/pricing" className="text-muted text-decoration-none">
									Pricing
								</Link>
							</li>
						</ul>
					</div>

					<div className="col-6 col-md-2">
						<h6 className="fw-bold text-uppercase small mb-3">Company</h6>
						<ul className="list-unstyled small mb-0">
							<li className="mb-2">
								<Link to="/support" className="text-muted text-decoration-none">
									Support
								</Link>
							</li>
							<li className="mb-2">
								<a href="#" className="text-muted text-decoration-none" aria-disabled="true">
									About
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="text-muted text-decoration-none" aria-disabled="true">
									Careers
								</a>
							</li>
						</ul>
					</div>

					<div className="col-6 col-md-2">
						<h6 className="fw-bold text-uppercase small mb-3">Legal</h6>
						<ul className="list-unstyled small mb-0">
							<li className="mb-2">
								<Link to="/terms" className="text-muted text-decoration-none">
									Terms &amp; Conditions
								</Link>
							</li>
							<li className="mb-2">
								<Link to="/terms" className="text-muted text-decoration-none">
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>

					<div className="col-6 col-md-2">
						<h6 className="fw-bold text-uppercase small mb-3">Connect</h6>
						<ul className="list-unstyled small mb-0">
							<li className="mb-2">
								<a href="mailto:legal@celebookems.com" className="text-muted text-decoration-none">
									Email us
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="text-muted text-decoration-none" aria-disabled="true">
									Twitter
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="text-muted text-decoration-none" aria-disabled="true">
									LinkedIn
								</a>
							</li>
						</ul>
					</div>
				</div>

				<hr className="my-4" />

				<div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
					<div>&copy; {year} CeleBook EMS. All rights reserved.</div>
					<div className="mt-2 mt-md-0">Made with care in Cognizant</div>
				</div>
			</div>
		</footer>
	);
}
