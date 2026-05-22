import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { BASE_URL, getImageUrl, EVENT_FALLBACK_IMG } from "../../lib/api";
import { checkInAttendee } from "../../api/registration.api";
import ParticipantCard from "../ParticipantCard";
import TicketModal from "../TicketModal";
import toast from "react-hot-toast";
import { useEventStats } from "./useEventStats";
import { useQRScanner } from "./useQRScanner";
import ConfirmRegisterModal from "./ConfirmRegisterModal";
import OrganizerStatsPanel from "./OrganizerStatsPanel";
import OrganizerDetailsPanel from "./OrganizerDetailsPanel";
import ScannerOverlay from "./ScannerOverlay";
import RejectReasonModal from "./RejectReasonModal";
import CancelReasonModal from "./CancelReasonModal";
import FeedbackSummary from "./FeedbackSummary";
import { triggerHostFeedback, getMyFeedback } from "../../api/feedback.api";

interface SingleEventProps {
	event: any;
	onClose: () => void;
	eventId?: string;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
	DRAFT: "bg-secondary",
	PENDING: "bg-warning text-dark",
	APPROVED: "bg-success",
	REJECTED: "bg-danger",
};

const STATUS_LABEL: Record<string, string> = {
	DRAFT: "Draft",
	PENDING: "Under Review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
};

export default function SingleEvent({ event, onClose, eventId }: SingleEventProps) {
	const navigate = useNavigate();
	const { user, isAuthenticated, accessToken } = useAuthStore();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [eventStatus, setEventStatus] = useState<string>(event.status);
	const [rejectionReason, setRejectionReason] = useState<string>(event.rejectionReason ?? "");
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [cancelReasonInput, setCancelReasonInput] = useState("");
	const [rejectReasonInput, setRejectReasonInput] = useState("");
	const [adminActing, setAdminActing] = useState(false);
	const [isRegistered, setIsRegistered] = useState<boolean>(!!event.userRegistration);
	const didAttend = event.userRegistration?.attendanceStatus === "PRESENT";

	const [showTicket, setShowTicket] = useState(false);
	const [showScanner, setShowScanner] = useState(false);
	const [marking, setMarking] = useState(false);

	const [hostFeedbackSentAt, setHostFeedbackSentAt] = useState<string | null>(
		event.hostFeedbackSentAt ?? null,
	);
	const [sendingFeedbackTrigger, setSendingFeedbackTrigger] = useState(false);
	const [myFeedbackSubmitted, setMyFeedbackSubmitted] = useState(false);
	const [feedbackSummaryRefresh, setFeedbackSummaryRefresh] = useState(0);

	const isDraftEvent = event.status === "DRAFT";
	const isPastEvent = !isDraftEvent && new Date(event.date).getTime() < Date.now();
	const isOrganizer = isAuthenticated && user?.id === event.organizerId;
	const isAdmin = isAuthenticated && user?.role === "ADMIN";
	const eid = eventId || event._id || event.id;

	const [eventStat, setEventStat] = useEventStats(eid, isOrganizer || isAdmin);
	const { scanResult, scanLoading, lastScannedToken, clearScan } = useQRScanner({
		showScanner,
		eventId: eid,
		onClose: () => setShowScanner(false),
	});

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
	});

	const handleMarkPresent = async () => {
		if (!lastScannedToken || !scanResult) return;
		setMarking(true);
		try {
			await checkInAttendee(eid, lastScannedToken, true);
			toast.success("Marked as present!");
			clearScan();
			setEventStat((prev: any) => prev ? {
				...prev,
				presentAttendees: [...(prev.presentAttendees ?? []), "1"],
			} : prev);
		} catch (err: any) {
			toast.error(err.message || "Failed to mark present");
		} finally {
			setMarking(false);
		}
	};

	const handleRegister = async () => {
		if (!accessToken) {
			setError("Please log in to register for this event");
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const res = await fetch(`${BASE_URL}/events/${eid}/register`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
			});

			const data = await res.json();

			if (res.status === 409) {
				setError("You are already registered for this event");
				return;
			}
			if (res.status === 400) {
				setError(data.message || "Cannot register for this event");
				return;
			}
			if (res.status === 401) {
				setError("Session expired. Please log in again");
				return;
			}
			if (res.status === 403) {
				if (data.code === "CONSENT_REQUIRED") {
					setError("You need to accept the terms and conditions to register");
				} else {
					setError("You don't have permission to register for this event");
				}
				return;
			}
			if (!res.ok) {
				setError(data.message || "Failed to register for event");
				return;
			}

			setSuccess(true);
			setIsRegistered(true);
			setShowConfirm(false);

			setTimeout(() => {
				onClose?.();
			}, 2000);
		} catch (err) {
			console.error("Registration error:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setHostFeedbackSentAt(event.hostFeedbackSentAt ?? null);
	}, [event.hostFeedbackSentAt]);

	useEffect(() => {
		if (!isAuthenticated || isOrganizer || isAdmin || !isRegistered || !isPastEvent) return;
		if (!hostFeedbackSentAt) return;
		let cancelled = false;
		getMyFeedback(eid)
			.then((res) => {
				if (cancelled) return;
				if (res?.data) setMyFeedbackSubmitted(true);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [eid, isAuthenticated, isOrganizer, isAdmin, isRegistered, isPastEvent, hostFeedbackSentAt]);

	const handleHostFeedbackTrigger = async () => {
		if (sendingFeedbackTrigger || hostFeedbackSentAt) return;
		setSendingFeedbackTrigger(true);
		try {
			const res = await triggerHostFeedback(eid);
			setHostFeedbackSentAt(res.hostFeedbackSentAt);
			setFeedbackSummaryRefresh((n) => n + 1);
			toast.success("Feedback request sent to attendees!");
		} catch (err: any) {
			toast.error(err?.message || "Could not send feedback request");
		} finally {
			setSendingFeedbackTrigger(false);
		}
	};

	const handleCancelRegistration = async () => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eid}/register`, {
				method: "DELETE",
				headers: authHeaders(),
				credentials: "include",
			});
			if (!res.ok) throw new Error((await res.json()).message);
			setIsRegistered(false);
			toast.success("Registration cancelled.");
		} catch (err: any) {
			toast.error(err?.message || "Could not cancel registration.");
		}
	};

	const handleShare = async () => {
		const shareData = {
			title: event.title,
			text: `Check out this event: ${event.title}`,
			url: window.location.href,
		};
		try {
			if (navigator.share && navigator.canShare?.(shareData)) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(window.location.href);
				toast.success("Link copied to clipboard!");
			}
		} catch (err) {
			if ((err as Error).name !== "AbortError") {
				console.error("Error sharing:", err);
			}
		}
	};

	const handleCancel = () => {
		setShowCancelModal(true);
	};

	const handleConfirmCancel = async () => {
		try {
			const res = await fetch(`${BASE_URL}/events/${event._id || event.id}/cancel`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify({ reason: cancelReasonInput }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast.success("Event cancelled.");
			setShowCancelModal(false);
			setCancelReasonInput("");
			navigate("/dashboard");
		} catch (err: any) {
			toast.error(err?.message || "Could not cancel the event.");
		}
	};

	const handleApprove = async () => {
		setAdminActing(true);
		try {
			const res = await fetch(`${BASE_URL}/admin/events/${event._id || event.id}/approve`, {
				method: "PATCH",
				headers: authHeaders(),
				credentials: "include",
			});
			if (!res.ok) throw new Error((await res.json()).message || "Could not approve.");
			setEventStatus("APPROVED");
			toast.success("Event approved and is now live.");
		} catch (err: any) {
			toast.error(err?.message || "Could not approve event.");
		} finally {
			setAdminActing(false);
		}
	};

	const handleReject = async () => {
		const reason = rejectReasonInput.trim();
		if (!reason) {
			toast.error("A rejection reason is required.");
			return;
		}
		setAdminActing(true);
		try {
			const res = await fetch(`${BASE_URL}/admin/events/${event._id || event.id}/reject`, {
				method: "PATCH",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify({ reason }),
			});
			if (!res.ok) throw new Error((await res.json()).message || "Could not reject.");
			setEventStatus("REJECTED");
			setRejectionReason(reason);
			setShowRejectModal(false);
			setRejectReasonInput("");
			toast.success("Event rejected. The organiser has been notified.");
		} catch (err: any) {
			toast.error(err?.message || "Could not reject event.");
		} finally {
			setAdminActing(false);
		}
	};

	const statusBadge = () => {
		if (!isOrganizer && !isAdmin) return null;
		// If already cancelled, the Cancelled badge covers it — no need for status badge too
		if (event.isCancelled) return null;
		return (
			<span className={`badge ${STATUS_BADGE_CLASS[eventStatus] ?? "bg-secondary"} rounded-pill px-3 py-2 ms-2`}>
				{STATUS_LABEL[eventStatus] ?? eventStatus}
			</span>
		);
	};

	const primaryButton = () => {
		if (isOrganizer || isAdmin) return null;

		if (!isAuthenticated) {
			return (
				<button
					className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm"
					onClick={() => navigate("/login")}
				>
					Login to Register
				</button>
			);
		}

		if (isPastEvent || event.isCancelled) {
			return (
				<button className="btn btn-secondary px-4 fw-bold rounded-pill" disabled>
					{event.isCancelled ? "Event Cancelled" : "Registration Closed"}
				</button>
			);
		}

		if (isRegistered) {
			return (
				<button className="btn btn-success px-4 fw-bold rounded-pill" disabled>
					✓ Already Registered
				</button>
			);
		}

		return (
			<button
				className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm"
				onClick={() => setShowConfirm(true)}
				disabled={loading}
			>
				{loading
					? "Processing..."
					: event.price === 0
						? "Register (FREE)"
						: `Book Ticket (${event.price === 0 ? "FREE" : `₹${event.price}`})`}
			</button>
		);
	};

	// ── Image slider ──────────────────────────────────────────────────────
	const sliderImages: string[] =
		event.imgUrls && event.imgUrls.length > 0
			? event.imgUrls.map((u: string) => getImageUrl(u))
			: [EVENT_FALLBACK_IMG];
	const hasMultipleImages = sliderImages.length > 1;
	const [sliderIdx, setSliderIdx] = useState(0);
	const sliderDragRef = useRef<number | null>(null);
	const sliderPrev = () => setSliderIdx((i) => Math.max(0, i - 1));
	const sliderNext = () => setSliderIdx((i) => Math.min(sliderImages.length - 1, i + 1));
	const onSliderDown = (x: number) => { sliderDragRef.current = x; };
	const onSliderUp   = (x: number) => {
		if (sliderDragRef.current === null) return;
		const d = sliderDragRef.current - x;
		if (d > 40) sliderNext(); else if (d < -40) sliderPrev();
		sliderDragRef.current = null;
	};


	return (
		<div className="row g-4 align-items-start">
			<div className="col-md-5 col-lg-4">
				<motion.div
					{...({ layoutId: `${event._id || event.id}` } as any)}
					className="position-relative rounded-4 overflow-hidden shadow-sm"
					style={{
						width: "100%",
						aspectRatio: "16/9",
						background: "var(--bs-secondary-bg)",
						opacity: !isDraftEvent && (isPastEvent || event.isCancelled) ? 0.6 : 1,
						filter: !isDraftEvent && (isPastEvent || event.isCancelled) ? "grayscale(1)" : "none",
						userSelect: "none",
					}}
					onMouseDown={(e: React.MouseEvent) => onSliderDown(e.clientX)}
					onMouseUp={(e: React.MouseEvent) => onSliderUp(e.clientX)}
					onMouseLeave={(_e: React.MouseEvent) => { sliderDragRef.current = null; }}
					onTouchStart={(e: React.TouchEvent) => onSliderDown(e.touches[0].clientX)}
					onTouchEnd={(e: React.TouchEvent) => onSliderUp(e.changedTouches[0].clientX)}
				>
					<div style={{
						display: "flex",
						height: "100%",
						width: `${sliderImages.length * 100}%`,
						transform: `translateX(-${(sliderIdx * 100) / sliderImages.length}%)`,
						transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
					}}>
						{sliderImages.map((src, i) => (
							<img key={i} src={src} alt={`${event.title}-${i}`} draggable={false}
								style={{
									width: `${100 / sliderImages.length}%`,
									height: "100%",
									objectFit: "cover",
									flexShrink: 0,
									pointerEvents: "none",
									display: "block",
								}}
							/>
						))}
					</div>
					{hasMultipleImages && (
						<>
							<button type="button"
								className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-0"
								style={{ width: 32, height: 32, fontSize: 16, opacity: sliderIdx === 0 ? 0.3 : 0.8, zIndex: 4 }}
								onClick={(e) => { e.stopPropagation(); sliderPrev(); }}
								disabled={sliderIdx === 0}
							>‹</button>
							<button type="button"
								className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-0"
								style={{ width: 32, height: 32, fontSize: 16, opacity: sliderIdx === sliderImages.length - 1 ? 0.3 : 0.8, zIndex: 4 }}
								onClick={(e) => { e.stopPropagation(); sliderNext(); }}
								disabled={sliderIdx === sliderImages.length - 1}
							>›</button>
							<div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1" style={{ zIndex: 4 }}>
								{sliderImages.map((_, i) => (
									<span key={i} onClick={() => setSliderIdx(i)}
										style={{
											width: i === sliderIdx ? 18 : 7, height: 7, borderRadius: 4,
											background: i === sliderIdx ? "#fff" : "rgba(255,255,255,0.5)",
											transition: "all 0.25s", cursor: "pointer", display: "inline-block",
										}}
									/>
								))}
							</div>
							<span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill"
								style={{ fontSize: 11, zIndex: 4 }}>
								{sliderIdx + 1} / {sliderImages.length}
							</span>
						</>
					)}
				</motion.div>
				{hasMultipleImages && (
					<div className="d-flex gap-2 mt-2 pb-1" style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
						{sliderImages.map((src, i) => (
							<div key={i} onClick={() => setSliderIdx(i)}
								className="flex-shrink-0 rounded-3 overflow-hidden"
								style={{
									width: 56, height: 56, cursor: "pointer",
									outline: i === sliderIdx ? "2.5px solid var(--bs-primary)" : "2px solid transparent",
									transition: "outline 0.15s",
								}}
							>
								<img src={src} alt={`thumb-${i}`} draggable={false}
									style={{ width: "100%", height: "100%", objectFit: "cover" }} />
							</div>
						))}
					</div>
				)}
				{isAdmin && !isOrganizer && event.organizer && (
					<OrganizerDetailsPanel organizer={event.organizer} eventStatus={eventStatus} />
				)}
			</div>

			<div className="col-md-7 col-lg-8">
				<div className="ps-md-2">
					<div className="d-flex align-items-center mb-2 flex-wrap gap-2">
						<span className="badge bg-primary-subtle text-primary rounded-pill px-3">{event.category}</span>
						{statusBadge()}
						{event.isCancelled && (
							<span className="badge bg-danger-subtle text-danger rounded-pill px-3">Cancelled</span>
						)}
					</div>

					<h2 className="fw-bold mb-1 text-body">{event.title}</h2>

					{(isOrganizer || isAdmin) && eventStatus === "REJECTED" && rejectionReason && (
						<div className="alert alert-danger py-2 px-3 rounded-3 small mb-3">
							<strong>Rejection reason:</strong> {rejectionReason}
						</div>
					)}

					{error && (
						<motion.div
							{...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
							className="alert alert-danger py-2 px-3 rounded-3 small mb-3"
						>
							{error}
						</motion.div>
					)}

					{success && (
						<motion.div
							{...({ initial: { scale: 0.9 }, animate: { scale: 1 } } as any)}
							className="alert alert-success py-2 px-3 rounded-3 small mb-3"
						>
							Registration successful! Redirecting...
						</motion.div>
					)}

					<div className="card border-0 bg-body-tertiary rounded-4 p-3 mb-4" style={{ maxWidth: "450px" }}>
						<div className="d-flex align-items-center mb-2 small text-body">
							<span className="me-2 text-primary">📅</span>
							<span className="fw-semibold">
								{new Date(event.date).toLocaleString([], {
									dateStyle: "medium",
									timeStyle: "short",
								})}
							</span>
						</div>
						<div className="d-flex align-items-center small text-body-secondary">
							<span className="me-2 text-primary">📍</span>
							<span>{event.location || "TBA"}</span>
						</div>
					</div>

					<h6 className="fw-bold text-uppercase small text-primary mb-2">About Event</h6>
					<p className="text-body-secondary small mb-4 lh-base" style={{ maxWidth: "650px" }}>
						{event.description}
					</p>

					{!isOrganizer && !isAdmin && !success && showConfirm && (
						<ConfirmRegisterModal
							event={event}
							loading={loading}
							onConfirm={handleRegister}
							onClose={() => setShowConfirm(false)}
						/>
					)}

					<div className="d-flex gap-2 pt-2 flex-wrap">
						{primaryButton()}
						{isAuthenticated && !isOrganizer && !isAdmin && isRegistered && !isPastEvent && (
							<button
								className="btn btn-outline-danger rounded-pill px-4 fw-bold"
								onClick={handleCancelRegistration}
							>
								Cancel Registration
							</button>
						)}
						{isAuthenticated &&
							!isOrganizer &&
							!isAdmin &&
							isRegistered &&
							didAttend &&
							isPastEvent &&
							!event.isCancelled && (
								myFeedbackSubmitted ? (
									<button
										className="btn btn-success px-4 fw-bold rounded-pill"
										disabled
									>
										✓ Feedback Submitted
									</button>
								) : (
									<button
										className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm"
										onClick={() => navigate(`/events/${event._id || event.id}/feedback`)}
										disabled={!hostFeedbackSentAt}
										title={
											hostFeedbackSentAt
												? undefined
												: "The host hasn't opened feedback for this event yet"
										}
									>
										📋 Give Feedback
									</button>
								)
							)}

						{isAuthenticated && !isOrganizer && !isAdmin && isRegistered && (
							<button
								className="btn btn-outline-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
								onClick={() => setShowTicket(true)}
							>
								<Ticket size={16} />
								View Ticket
							</button>
						)}

						{(isOrganizer || isAdmin) && (
							<>
								
								{isOrganizer && ["DRAFT", "REJECTED"].includes(eventStatus) && (
									<button
										className="btn btn-outline-primary rounded-pill px-4 fw-bold"
										onClick={() => navigate(`/create?edit=${event._id || event.id}`)}
									>
										Edit
									</button>
								)}

								{isOrganizer && ["DRAFT", "REJECTED"].includes(eventStatus) && !event.isCancelled && (
									<button
										className="btn btn-success rounded-pill px-4 fw-bold"
										onClick={() => navigate(`/create?edit=${event._id || event.id}&publish=1`)}
									>
										Publish
									</button>
								)}

								{isOrganizer &&
									["APPROVED", "PENDING"].includes(eventStatus) &&
									!event.isCancelled &&
									!isPastEvent &&
									(event.price === 0 || !eventStat || eventStat.registeredAttendees?.length === 0) && (
										<button
											className="btn btn-outline-danger rounded-pill px-4 fw-bold"
											onClick={handleCancel}
										>
											Cancel Event
										</button>
									)}

								{isAdmin &&
									["APPROVED", "PENDING"].includes(eventStatus) &&
									!event.isCancelled &&
									!isPastEvent &&
									(event.price === 0 || !eventStat || eventStat.registeredAttendees?.length === 0) && (
										<button
											className="btn btn-outline-danger rounded-pill px-4 fw-bold"
											onClick={handleCancel}
										>
											Cancel Event
										</button>
									)}

								{isAdmin && eventStatus === "PENDING" && !event.isCancelled && (
									<>
										<button
											className="btn btn-success rounded-pill px-4 fw-bold"
											onClick={handleApprove}
											disabled={adminActing}
										>
											{adminActing ? (
												<span className="spinner-border spinner-border-sm me-1" role="status" />
											) : null}
											Approve
										</button>
										<button
											className="btn btn-danger rounded-pill px-4 fw-bold"
											onClick={() => setShowRejectModal(true)}
											disabled={adminActing}
										>
											Reject
										</button>
									</>
								)}
							</>
						)}

						<button onClick={handleShare} className="btn btn-outline-secondary rounded-pill px-4">
							Share
						</button>

						{isAuthenticated && isOrganizer && isPastEvent && !event.isCancelled && (
							<button
								className={`btn rounded-pill px-4 fw-bold ${hostFeedbackSentAt ? "btn-success" : "btn-warning"}`}
								onClick={handleHostFeedbackTrigger}
								disabled={!!hostFeedbackSentAt || sendingFeedbackTrigger}
							>
								{sendingFeedbackTrigger ? (
									<>
										<span className="spinner-border spinner-border-sm me-2" role="status" />
										Sending...
									</>
								) : hostFeedbackSentAt ? (
									"✓ Feedback Sent"
								) : (
									"Leave Feedback"
								)}
							</button>
						)}
					</div>

					{(isOrganizer || isAdmin) && (
						<OrganizerStatsPanel
							event={event}
							eventStat={eventStat}
							scanLoading={scanLoading}
							onScan={() => setShowScanner(true)}
						/>
					)}

					{isPastEvent && !event.isCancelled && (
						<FeedbackSummary eventId={eid} refreshKey={feedbackSummaryRefresh} />
					)}
				</div>
			</div>

			<AnimatePresence>
				{showTicket && (
					<TicketModal
						booking={{
							_id: String(event.userRegistration?._id ?? event.userRegistration?.id ?? ""),
							eventId: event,
							userId: user?.id ?? "",
							status: "CONFIRMED",
							registeredAt: event.userRegistration?.registeredAt ?? "",
						}}
						onClose={() => setShowTicket(false)}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{showScanner && <ScannerOverlay onClose={() => setShowScanner(false)} />}
			</AnimatePresence>

			{scanResult && (
				<ParticipantCard
					result={scanResult}
					marking={marking}
					onMarkPresent={handleMarkPresent}
					onClose={clearScan}
				/>
			)}

			{showRejectModal && (
				<RejectReasonModal
					value={rejectReasonInput}
					adminActing={adminActing}
					onChange={setRejectReasonInput}
					onClose={() => {
						setShowRejectModal(false);
						setRejectReasonInput("");
					}}
					onConfirm={handleReject}
				/>
			)}

			{showCancelModal && (
				<CancelReasonModal
					value={cancelReasonInput}
					acting={false}
					onChange={setCancelReasonInput}
					onClose={() => {
						setShowCancelModal(false);
						setCancelReasonInput("");
					}}
					onConfirm={handleConfirmCancel}
				/>
			)}
		</div>
	);
}
