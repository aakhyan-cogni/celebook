import { useSearchParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import SingleEvent from "../components/SingleEvent";
import { useLocalDB } from "../store";

export default function Events() {
	const [searchParams] = useSearchParams();
	const events = useLocalDB((s) => s.events);
	const navigate = useNavigate();
	const eventId = searchParams.get("q");
	const event = events.find((e) => e.id === eventId);

	if (!eventId) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 0 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="bg-body pt-0 pb-5 d-flex flex-column"
		>
			<div className="container">
				<div className="py-2">
					<button
						onClick={() => navigate(-1)}
						className="btn btn-link text-decoration-none text-primary fw-bold p-0 d-flex align-items-center"
						style={{ fontSize: "0.85rem", transition: "transform 0.2s" }}
						onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-4px)")}
						onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
					>
						<span className="me-2" style={{ fontSize: "1.5rem" }}>
							←
						</span>
						Back
					</button>
				</div>

				<hr className="opacity-10 mt-1 mb-4" />
				{event ? (
					<SingleEvent event={event} onClose={() => navigate(-1)} />
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center py-5 mt-5"
					>
						{/* Visual Element */}
						<div className="mb-4">
							<div
								className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3 shadow-sm"
								style={{ width: "100px", height: "100px", fontSize: "3rem" }}
							>
								🔍
							</div>
						</div>

						{/* Text Content */}
						<h2 className="fw-bold text-dark mb-2">Event Not Found</h2>
						<p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px" }}>
							We couldn't find the event you're looking for. It may have been deleted, or the link might
							be incorrect.
						</p>

						{/* Call to Action */}
						<div className="d-flex gap-3 justify-content-center">
							<button
								onClick={() => navigate(-1)}
								className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold"
							>
								Back to Events
							</button>
							<button
								onClick={() => navigate("/dashboard")}
								className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold"
							>
								Go to Dashboard
							</button>
						</div>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}
