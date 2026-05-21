import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { motion } from "motion/react";
import { Link } from "react-router";
import { fetchTerms, type TermsDoc } from "../api/terms.api";

function formatDate(iso?: string) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
	} catch {
		return iso;
	}
}

export default function Terms() {
	const [terms, setTerms] = useState<TermsDoc | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		fetchTerms()
			.then((data) => {
				if (!cancelled) setTerms(data);
			})
			.catch((err) => {
				if (!cancelled) setError(err?.message || "Failed to load Terms & Conditions.");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const sanitized = useMemo(
		() => (terms?.content ? DOMPurify.sanitize(terms.content, { USE_PROFILES: { html: true } }) : ""),
		[terms?.content],
	);

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
						<p className="text-muted small mb-5">
							{terms?.version && <span className="me-2">Version {terms.version} ·</span>}
							Last updated: {formatDate(terms?.updatedAt)}
						</p>

						{loading && (
							<div className="text-center py-5">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading…</span>
								</div>
							</div>
						)}

						{error && !loading && (
							<div className="alert alert-danger" role="alert">
								{error}
							</div>
						)}

						{!loading && !error && terms && (
							<div className="terms-content" dangerouslySetInnerHTML={{ __html: sanitized }} />
						)}

						<hr />
						<p className="text-muted small text-center mt-3">
							© {new Date().getFullYear()} CeleBook EMS. All rights reserved.
						</p>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
