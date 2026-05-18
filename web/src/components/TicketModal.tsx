import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { X, MapPin, Calendar, Tag } from "lucide-react";
import { fetchTicketToken } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type { Booking } from "../store";

interface TicketModalProps {
	booking: Booking;
	onClose: () => void;
}

export default function TicketModal({ booking, onClose }: TicketModalProps) {
	const user = useAuthStore((s) => s.user);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const ev = booking.eventId as any;
	const registrationId = (booking as any)._id ?? (booking as any).id;

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const data = await fetchTicketToken(registrationId);
				if (!cancelled) setToken(data.token);
			} catch (err: any) {
				if (!cancelled) setError(err.message || "Failed to load ticket");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => { cancelled = true; };
	}, [registrationId]);

	const eventDate = ev?.date ? new Date(ev.date) : null;
	const formattedDate = eventDate
		? eventDate.toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
		: "—";

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1050,
					backgroundColor: "rgba(0,0,0,0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "1rem",
				}}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ duration: 0.2 }}
					onClick={(e) => e.stopPropagation()}
					className="card border-0 shadow-lg rounded-4 overflow-hidden"
					style={{ width: "100%", maxWidth: 460 }}
				>
					{/* Header */}
					<div
						className="card-header border-0 d-flex justify-content-between align-items-center py-3 px-4"
						style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
					>
						<div>
							<div className="text-white fw-bold fs-5 mb-0">{ev?.title ?? "Event Ticket"}</div>
							<small className="text-white opacity-75">Your confirmed ticket</small>
						</div>
						<button
							className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center p-1"
							style={{ width: 32, height: 32 }}
							onClick={onClose}
						>
							<X size={16} />
						</button>
					</div>

					{/* Event details strip */}
					<div className="px-4 py-3 border-bottom d-flex flex-column gap-1" style={{ background: "#f8f9ff" }}>
						<div className="d-flex align-items-center gap-2 text-secondary small">
							<Calendar size={14} />
							<span>{formattedDate}</span>
						</div>
						{ev?.location && (
							<div className="d-flex align-items-center gap-2 text-secondary small">
								<MapPin size={14} />
								<span>{ev.location}</span>
							</div>
						)}
						{ev?.category && (
							<div className="d-flex align-items-center gap-2 text-secondary small">
								<Tag size={14} />
								<span className="badge rounded-pill text-bg-primary">{ev.category}</span>
							</div>
						)}
					</div>

					{/* Attendee row */}
					<div className="px-4 py-3 border-bottom d-flex align-items-center gap-3">
						<div
							className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
							style={{ width: 40, height: 40, background: "#6366f1", fontSize: 16 }}
						>
							{user?.name?.charAt(0).toUpperCase() ?? "?"}
						</div>
						<div>
							<div className="fw-semibold">{user?.name ?? "Attendee"}</div>
							<div className="text-secondary small">{user?.email}</div>
						</div>
					</div>

					{/* QR code */}
					<div className="card-body d-flex flex-column align-items-center py-4 gap-3">
						{loading && (
							<div className="d-flex flex-column align-items-center gap-2 py-3">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading QR...</span>
								</div>
								<small className="text-secondary">Generating your QR code…</small>
							</div>
						)}

						{!loading && error && (
							<div className="alert alert-danger mb-0 text-center small">{error}</div>
						)}

						{!loading && token && (
							<div className="p-3 rounded-3 border" style={{ background: "#fff" }}>
								<QRCodeSVG value={token} size={200} level="M" />
							</div>
						)}

						<p className="text-secondary text-center small mb-0">
							Show this QR code to the event organizer for check-in.
							<br />
							<span className="text-muted" style={{ fontSize: "0.75rem" }}>Valid for 24 hours.</span>
						</p>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
