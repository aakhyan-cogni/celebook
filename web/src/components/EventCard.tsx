import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getImageUrl, EVENT_FALLBACK_IMG } from "../lib/api";

interface EventCardProps {
	event: any;
	onClick: (event: any) => void;
}

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function EventCard({ event, onClick }: EventCardProps) {
	const [timeLeft, setTimeLeft] = useState("");
	const eventTime = new Date(event.date).getTime();
	const isPast = eventTime < Date.now();

	useEffect(() => {
		if (isPast) return;

		const updateTimer = () => {
			const now = Date.now();
			const diff = eventTime - now;
			if (diff <= 0) {
				setTimeLeft("LIVE");
			} else if (diff < 86400000) {
				const hours = Math.floor(diff / 3600000);
				const mins = Math.floor((diff % 3600000) / 60000);
				setTimeLeft(`${hours}h ${mins}m`);
			}
		};

		updateTimer();
		const timer = setInterval(updateTimer, 60000);
		return () => clearInterval(timer);
	}, [eventTime, isPast]);

	const getStatusBadge = () => {
		const now = Date.now();
		const diff = eventTime - now;

		if (event.isCancelled) {
			return <span className="badge bg-danger px-3 py-2">Cancelled</span>;
		}

		if (isPast) {
			return <span className="badge bg-secondary-subtle text-secondary px-3 py-2">Past Event</span>;
		}

		if (diff < 1800000 && diff > -3600000) {
			return (
				<span className="badge bg-danger px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
					<span className="spinner-grow spinner-grow-sm" role="status"></span>
					LIVE NOW
				</span>
			);
		}

		if (diff < 86400000) {
			return (
				<span className="badge bg-warning text-dark px-3 py-2 shadow-sm">
					Starts in {timeLeft || "24h"}
				</span>
			);
		}

		return (
			<span className="badge bg-primary px-3 py-2 shadow-sm">
				{new Date(event.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				})}
			</span>
		);
	};

	// Fix: use getImageUrl so relative paths (/uploads/...) become full URLs
	const imgSrc = event.imgUrls?.[0]
		? getImageUrl(event.imgUrls[0])
		: EVENT_FALLBACK_IMG;

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			animate="visible"
			onClick={() => onClick(event)}
			className={`card h-100 border-0 shadow-sm overflow-hidden rounded-4 bg-body-tertiary ${isPast || event.isCancelled ? "opacity-60 grayscale" : ""}`}
			style={{
				transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
				cursor: "pointer",
				border: "1px solid var(--bs-border-color-translucent)",
			}}
		>
			<div className="position-relative">
				<img
					src={imgSrc}
					className="card-img-top"
					alt={event.title}
					style={{ height: "200px", objectFit: "cover" }}
				/>
				<div className="position-absolute bottom-0 start-0 m-3">
					{getStatusBadge()}
				</div>
				<div className="position-absolute top-0 end-0 m-3">
					<span className="badge bg-dark bg-opacity-75 text-white border border-white border-opacity-10 shadow-sm">
						{event.category}
					</span>
				</div>
				{event.status && event.status !== "APPROVED" && (
					<div className="position-absolute top-0 start-0 m-3">
						{event.status === "PENDING" && (
							<span className="badge bg-warning text-dark px-3 py-2 shadow-sm">
								Pending Review
							</span>
						)}
						{event.status === "REJECTED" && (
							<span className="badge bg-danger px-3 py-2 shadow-sm">Rejected</span>
						)}
						{event.status === "DRAFT" && (
							<span className="badge bg-secondary px-3 py-2 shadow-sm">Draft</span>
						)}
					</div>
				)}
			</div>

			<div className="card-body p-4">
				<div className="d-flex justify-content-between align-items-start mb-2">
					<h5
						className={`fw-bold mb-0 text-truncate text-body ${isPast ? "opacity-50" : ""}`}
						style={{ maxWidth: "70%" }}
					>
						{event.title}
					</h5>
					<span className="text-success fw-bold">
						{event.price === 0 ? "FREE" : `₹${event.price}`}
					</span>
				</div>

				<div className="d-flex align-items-center gap-2 mb-2">
					<p className="text-body-secondary small mb-0">📍 {event.location}</p>
				</div>

				<p className="card-text text-body-secondary mb-3 line-clamp-2 small">
					{event.description}
				</p>
			</div>
		</motion.div>
	);
}
