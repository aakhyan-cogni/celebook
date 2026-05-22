import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getImageUrl, EVENT_FALLBACK_IMG } from "../lib/api";

interface EventCardProps {
	event: any;
	onClick: (event: any) => void;
	eventStatus?: boolean | false;
}

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function EventCard({ event, onClick, eventStatus }: EventCardProps) {
	const [timeLeft, setTimeLeft] = useState("");
	const eventTime = new Date(event.date).getTime();
	const isPast = eventTime < Date.now();

	// Image slider state
	const images: string[] =
		event.imgUrls && event.imgUrls.length > 0
			? event.imgUrls.map((u: string) => getImageUrl(u))
			: [EVENT_FALLBACK_IMG];
	const hasMultiple = images.length > 1;
	const [activeIdx, setActiveIdx] = useState(0);
	const dragStartX = useRef<number | null>(null);

	const prevImg = (e: React.MouseEvent) => {
		e.stopPropagation();
		setActiveIdx((i) => (i - 1 + images.length) % images.length);
	};
	const nextImg = (e: React.MouseEvent) => {
		e.stopPropagation();
		setActiveIdx((i) => (i + 1) % images.length);
	};

	const onPointerDown = (clientX: number) => { dragStartX.current = clientX; };
	const onPointerUp = (clientX: number) => {
		if (dragStartX.current === null) return;
		const delta = dragStartX.current - clientX;
		if (delta > 40) setActiveIdx((i) => (i + 1) % images.length);
		else if (delta < -40) setActiveIdx((i) => (i - 1 + images.length) % images.length);
		dragStartX.current = null;
	};

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

		if (event.isCancelled)
			return <span className="badge bg-danger px-3 py-2">Cancelled</span>;
		if (isPast)
			return <span className="badge bg-secondary-subtle text-secondary px-3 py-2">Past Event</span>;
		if (diff < 1800000 && diff > -3600000) {
			return (
				<span className="badge bg-danger px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
					<span className="spinner-grow spinner-grow-sm" role="status"></span>
					LIVE NOW
				</span>
			);
		}
		if (diff < 86400000)
			return <span className="badge bg-warning text-dark px-3 py-2 shadow-sm">Starts in {timeLeft || "24h"}</span>;

		return (
			<span className="badge bg-primary px-3 py-2 shadow-sm">
				{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
			</span>
		);
	};

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
			{/* ── Image area with slider ── */}
			<div
				className="position-relative overflow-hidden"
				style={{ width: "100%", maxHeight: "220px", background: "var(--bs-secondary-bg)" }}
				onMouseDown={(e) => onPointerDown(e.clientX)}
				onMouseUp={(e) => onPointerUp(e.clientX)}
				onMouseLeave={() => { dragStartX.current = null; }}
				onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
				onTouchEnd={(e) => onPointerUp(e.changedTouches[0].clientX)}
			>
				{/* Slides */}
				<div
					className="d-flex h-100"
					style={{
						display: "flex",
						width: `${images.length * 100}%`,
						transform: `translateX(-${(activeIdx * 100) / images.length}%)`,
						transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
					}}
				>
					{images.map((src, i) => (
						<img
							key={i}
							src={src}
							alt={`${event.title}-${i}`}
							draggable={false}
							style={{
								width: `${100 / images.length}%`,
								maxHeight: "220px",
								objectFit: "contain",
								flexShrink: 0,
								pointerEvents: "none",
								display: "block",
							}}
						/>
					))}
				</div>

				{/* Prev / Next buttons */}
				{hasMultiple && (
					<>
						<button
							type="button"
							onClick={prevImg}
							className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-0"
							style={{ width: 28, height: 28, fontSize: 14, opacity: 0.75, zIndex: 4 }}
						>‹</button>
						<button
							type="button"
							onClick={nextImg}
							className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-0"
							style={{ width: 28, height: 28, fontSize: 14, opacity: 0.75, zIndex: 4 }}
						>›</button>

						{/* Dot indicators */}
						<div
							className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1"
							style={{ zIndex: 4 }}
							onClick={(e) => e.stopPropagation()}
						>
							{images.map((_, i) => (
								<span
									key={i}
									onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
									style={{
										width: i === activeIdx ? 16 : 6,
										height: 6,
										borderRadius: 3,
										background: i === activeIdx ? "#fff" : "rgba(255,255,255,0.5)",
										transition: "all 0.25s",
										cursor: "pointer",
										display: "inline-block",
									}}
								/>
							))}
						</div>
					</>
				)}

				{/* Status badge bottom-left */}
				<div className="position-absolute bottom-0 start-0 m-3" style={{ zIndex: 3 }}>
					{getStatusBadge()}
				</div>

				{/* Category badge top-right */}
				<div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 3 }}>
					<span className="badge bg-dark bg-opacity-75 text-white border border-white border-opacity-10 shadow-sm">
						{event.category}
					</span>
				</div>

				{/* Event status badge top-left */}
				{!event.isCancelled && event.status && (eventStatus || event.status !== "APPROVED") && (
					<div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 3 }}>
						{event.status === "PENDING"  && <span className="badge bg-warning text-dark px-3 py-2 shadow-sm">Pending Review</span>}
						{event.status === "REJECTED" && <span className="badge bg-danger px-3 py-2 shadow-sm">Rejected</span>}
						{event.status === "DRAFT"    && <span className="badge bg-secondary px-3 py-2 shadow-sm">Draft</span>}
						{event.status === "APPROVED" && <span className="badge bg-success px-3 py-2 shadow-sm">Approved</span>}
					</div>
				)}
			</div>

			{/* ── Card body ── */}
			<div className="card-body p-4">
				<div className="d-flex justify-content-between align-items-start mb-2">
					<h5
						className={`fw-bold mb-0 text-truncate text-body ${isPast ? "opacity-50" : ""}`}
						style={{ maxWidth: "70%" }}
					>
						{event.title}
					</h5>
					<span className="text-success fw-bold">{event.price === 0 ? "FREE" : `₹${event.price}`}</span>
				</div>
				<div className="d-flex align-items-center gap-2 mb-2">
					<p className="text-body-secondary small mb-0">📍 {event.location}</p>
				</div>
				<p
					className="card-text text-body-secondary mb-3 small"
					style={{
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{event.description}
				</p>
			</div>
		</motion.div>
	);
}
