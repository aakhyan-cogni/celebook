import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { ScanLine, X, Ticket } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { BASE_URL, getImageUrl, EVENT_FALLBACK_IMG, checkInAttendee } from "../lib/api";
import type { CheckInResult } from "../lib/api";
import ParticipantCard from "./ParticipantCard";
import TicketModal from "./TicketModal";
import toast from "react-hot-toast";

interface SingleEventProps {
	event: any;
	onClose: () => void;
	eventId?: string;
}

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
	const [rejectReasonInput, setRejectReasonInput] = useState("");
	const [adminActing, setAdminActing] = useState(false);
	const [isRegistered, setIsRegistered] = useState<boolean>(!!event.userRegistration);
	const [eventStat, setEventStat] = useState<any>(null);

	const [showTicket, setShowTicket] = useState(false);
	const [showScanner, setShowScanner] = useState(false);
	const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
	const [scanLoading, setScanLoading] = useState(false);
	const [marking, setMarking] = useState(false);
	const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
	const scannerRef = useRef<any>(null);

	const isPastEvent = new Date(event.date).getTime() < Date.now();
	const isOrganizer = isAuthenticated && user?.id === event.organizerId;
	const isAdmin = isAuthenticated && user?.role === "ADMIN";

	useEffect(() => {
		if (!(isOrganizer || isAdmin) || !accessToken) return;
		const eid = eventId || event._id || event.id;
		fetch(`${BASE_URL}/events/${eid}/stats`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			credentials: "include",
		})
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => setEventStat(data))
			.catch(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOrganizer, isAdmin, accessToken]);

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
	});

	useEffect(() => {
		if (!showScanner) return;

		let scanner: any;
		const eid = eventId || event._id || event.id;

		import("html5-qrcode").then(({ Html5Qrcode }) => {
			scanner = new Html5Qrcode("qr-reader-se");
			scannerRef.current = scanner;

			scanner
				.start(
					{ facingMode: "environment" },
					{ fps: 15, qrbox: { width: 280, height: 280 } },
					async (decodedText: string) => {
						if (scanLoading) return;
						setScanLoading(true);
						try {
							await scanner.stop();
							scannerRef.current = null;
							setShowScanner(false);
							const result = await checkInAttendee(eid, decodedText, false);
							setLastScannedToken(decodedText);
							setScanResult(result);
						} catch (err: any) {
							scannerRef.current = null;
							toast.error(err.message || "Invalid QR code");
							setShowScanner(false);
						} finally {
							setScanLoading(false);
						}
					},
					() => {},
				)
				.catch(() => {
					toast.error("Could not access camera. Please allow camera permissions.");
					setShowScanner(false);
				});
		});

		return () => {
			if (scannerRef.current) {
				scannerRef.current.stop().catch(() => {});
				scannerRef.current = null;
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showScanner]);

	const handleMarkPresent = async () => {
		if (!lastScannedToken || !scanResult) return;
		const eid = eventId || event._id || event.id;
		setMarking(true);
		try {
			await checkInAttendee(eid, lastScannedToken, true);
			toast.success("Marked as present!");
			setScanResult(null);
			setLastScannedToken(null);
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
			const eventIdToUse = eventId || event._id || event.id;
			const res = await fetch(`${BASE_URL}/events/${eventIdToUse}/register`, {
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
			toast.success("Registration successful!");
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

	const handleCancelRegistration = async () => {
		const eid = eventId || event._id || event.id;
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

	const handleCancel = async () => {
		const reason = prompt("Reason for cancellation (optional):") ?? "";
		try {
			const res = await fetch(`${BASE_URL}/events/${event._id || event.id}/cancel`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify({ reason }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast.success("Event cancelled.");
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
		const map: Record<string, string> = {
			DRAFT: "bg-secondary",
			PENDING: "bg-warning text-dark",
			APPROVED: "bg-success",
			REJECTED: "bg-danger",
		};
		const labels: Record<string, string> = {
			DRAFT: "Draft",
			PENDING: "Under Review",
			APPROVED: "Approved",
			REJECTED: "Rejected",
		};
		return (
			<span className={`badge ${map[eventStatus] ?? "bg-secondary"} rounded-pill px-3 py-2 ms-2`}>
				{labels[eventStatus] ?? eventStatus}
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

	return (
		<div className="row g-4 align-items-start">
			{}
			<div className="col-md-5 col-lg-4">
				<motion.img
					layoutId={`${event._id || event.id}`}
					src={event.imgUrls?.[0] ? getImageUrl(event.imgUrls[0]) : EVENT_FALLBACK_IMG}
					className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover"
					style={{
						maxHeight: "320px",
						minHeight: "280px",
						opacity: isPastEvent || event.isCancelled ? 0.6 : 1,
						filter: isPastEvent || event.isCancelled ? "grayscale(1)" : "none",
					}}
					alt={event.title}
				/>
			</div>

			{}
			<div className="col-md-7 col-lg-8">
				<div className="ps-md-2">
					{}
					<div className="d-flex align-items-center mb-2 flex-wrap gap-2">
						<span className="badge bg-primary-subtle text-primary rounded-pill px-3">{event.category}</span>
						{statusBadge()}
						{event.isCancelled && (
							<span className="badge bg-danger-subtle text-danger rounded-pill px-3">Cancelled</span>
						)}
					</div>

					<h2 className="fw-bold mb-1 text-body">{event.title}</h2>

					{}
					{(isOrganizer || isAdmin) && eventStatus === "REJECTED" && rejectionReason && (
						<div className="alert alert-danger py-2 px-3 rounded-3 small mb-3">
							<strong>Rejection reason:</strong> {rejectionReason}
						</div>
					)}

					{}
					{error && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="alert alert-danger py-2 px-3 rounded-3 small mb-3"
						>
							{error}
						</motion.div>
					)}

					{success && (
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							className="alert alert-success py-2 px-3 rounded-3 small mb-3"
						>
							Registration successful! Redirecting...
						</motion.div>
					)}

					{}
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

					{/* Ticket confirmation popup — when not organizer/admin */}
					{!isOrganizer && !isAdmin && !success && showConfirm && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
							style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
							onClick={() => !loading && setShowConfirm(false)}
						>
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="card border-0 rounded-4 p-4 shadow-lg"
								style={{ maxWidth: "420px", width: "90%" }}
								onClick={(e) => e.stopPropagation()}
							>
								<div className="text-center mb-3">
									<div style={{ fontSize: "3rem" }}>🎟️</div>
									<h5 className="fw-bold mt-2 mb-1">Confirm your ticket</h5>
									<p className="text-body-secondary small mb-0">
										You're booking a ticket for <strong>{event.title}</strong>
									</p>
									<p className="fw-bold mt-2 mb-0">
										{event.price === 0 ? "FREE" : `₹${event.price}`}
									</p>
								</div>
								<div className="d-flex gap-2 justify-content-center">
									<button
										onClick={handleRegister}
										className="btn btn-success fw-bold rounded-pill px-4"
										disabled={loading}
									>
										{loading ? "Confirming..." : "Confirm"}
									</button>
									<button
										onClick={() => setShowConfirm(false)}
										className="btn btn-outline-secondary fw-bold rounded-pill px-4"
										disabled={loading}
									>
										Cancel
									</button>
								</div>
							</motion.div>
						</motion.div>
					)}

					<div className="d-flex gap-2 pt-2 flex-wrap">
						{}
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
							isPastEvent &&
							!event.isCancelled && (
								<button
									className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm"
									onClick={() => navigate(`/events/${event._id || event.id}/feedback`)}
								>
									📋 Give Feedback
								</button>
							)}

						{}
						{isAuthenticated && !isOrganizer && !isAdmin && isRegistered && (
							<button
								className="btn btn-outline-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
								onClick={() => setShowTicket(true)}
							>
								<Ticket size={16} />
								View Ticket
							</button>
						)}

						{/* Organizer + Admin controls */}
						{(isOrganizer || isAdmin) && (
							<>
								{}
								{["DRAFT", "REJECTED"].includes(eventStatus) && (
									<button
										className="btn btn-outline-primary rounded-pill px-4 fw-bold"
										onClick={() => navigate(`/create?edit=${event._id || event.id}`)}
									>
										Edit
									</button>
								)}

								{}
								{["DRAFT", "REJECTED"].includes(eventStatus) && !event.isCancelled && (
									<button
										className="btn btn-success rounded-pill px-4 fw-bold"
										onClick={() => navigate(`/create?edit=${event._id || event.id}&publish=1`)}
									>
										Publish
									</button>
								)}

								{}
								{["APPROVED", "PENDING"].includes(eventStatus) &&
									!event.isCancelled &&
									!isPastEvent &&
									!eventStat && (
										<button
											className="btn btn-outline-danger rounded-pill px-4 fw-bold"
											onClick={handleCancel}
										>
											Cancel Event
										</button>
									)}

								{}
								{isAdmin && eventStatus === "PENDING" && (
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

						{}
						<button onClick={handleShare} className="btn btn-outline-secondary rounded-pill px-4">
							Share
						</button>

						{}
						{isPastEvent && isAuthenticated && !isOrganizer && !isAdmin && (
							<button
								className="btn btn-outline-warning rounded-pill px-4 fw-bold"
								onClick={() =>
									document.getElementById("feedback-section")?.scrollIntoView({ behavior: "smooth" })
								}
							>
								Leave Feedback
							</button>
						)}
					</div>

					{}
					{(isOrganizer || isAdmin) && (
						<div className="card border-0 bg-body-tertiary rounded-4 overflow-hidden mt-4">
							{/* Panel header */}
							<div
								className="px-4 py-3 d-flex align-items-center justify-content-between"
								style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
							>
								<div>
									<div className="text-white fw-bold small text-uppercase" style={{ letterSpacing: "0.07em" }}>
										Organizer Panel
									</div>
									<div className="text-white opacity-75" style={{ fontSize: "0.72rem" }}>
										Only visible to you
									</div>
								</div>
								<span className={`badge rounded-pill px-3 py-2 ${{
									APPROVED: "bg-success",
									PENDING: "bg-warning text-dark",
									REJECTED: "bg-danger",
									DRAFT: "bg-secondary",
								}[eventStatus] ?? "bg-secondary"}`} style={{ fontSize: "0.72rem" }}>
									{{ APPROVED: "Approved", PENDING: "Under Review", REJECTED: "Rejected", DRAFT: "Draft" }[eventStatus] ?? eventStatus}
								</span>
							</div>

							<div className="p-4">
								{/* Capacity bar */}
								<div className="mb-4">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="small text-body-secondary fw-semibold">Capacity</span>
										<span className="small fw-bold text-body">
											{event.registrationCount ?? 0} / {event.capacity} registered
										</span>
									</div>
									<div className="progress rounded-pill bg-body" style={{ height: 8 }}>
										<div
											className="progress-bar rounded-pill bg-primary"
											style={{ width: `${Math.min(((event.registrationCount ?? 0) / event.capacity) * 100, 100)}%` }}
										/>
									</div>
								</div>

								{/* Stats row */}
								<div className="row g-3 mb-4">
									<div className="col-4 text-center">
										<div className="fw-bold fs-5 text-primary">{event.registrationCount ?? 0}</div>
										<div className="small text-body-secondary">Registered</div>
									</div>
									<div className="col-4 text-center border-start border-end border-secondary border-opacity-25">
										<div className="fw-bold fs-5 text-success">{eventStat?.presentAttendees?.length ?? 0}</div>
										<div className="small text-body-secondary">Present</div>
									</div>
									<div className="col-4 text-center">
										<div className="fw-bold fs-5 text-body">{event.price === 0 ? "FREE" : `₹${event.price}`}</div>
										<div className="small text-body-secondary">Price</div>
									</div>
								</div>

								{/* Footer row */}
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center gap-2">
										<span className="small text-body-secondary">Visibility</span>
										<span className="badge rounded-pill text-bg-secondary">{event.visibility}</span>
									</div>
									<button
										className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
										onClick={() => setShowScanner(true)}
										disabled={scanLoading}
									>
										{scanLoading
											? <span className="spinner-border spinner-border-sm" role="status" />
											: <ScanLine size={15} />}
										Scan QR
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* View Ticket modal */}
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

			{/* QR Scanner modal */}
			<AnimatePresence>
				{showScanner && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowScanner(false)}
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 1050,
							backgroundColor: "rgba(0,0,0,0.75)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "1rem",
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							onClick={(e) => e.stopPropagation()}
							className="card border-0 shadow-lg rounded-4 overflow-hidden"
							style={{ width: "100%", maxWidth: 400 }}
						>
							<div className="card-header border-0 d-flex justify-content-between align-items-center py-3 px-4 bg-dark text-white">
								<div className="d-flex align-items-center gap-2">
									<ScanLine size={18} />
									<span className="fw-semibold">Scan Attendee QR</span>
								</div>
								<button
									className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-1"
									style={{ width: 32, height: 32 }}
									onClick={() => setShowScanner(false)}
								>
									<X size={16} />
								</button>
							</div>
							<div className="card-body p-0">
								<div id="qr-reader-se" style={{ width: "100%" }} />
							</div>
							<div className="card-footer border-0 bg-transparent text-center py-3">
								<small className="text-secondary">Point the camera at the attendee's QR code</small>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Participant card after scan */}
			{scanResult && (
				<ParticipantCard
					result={scanResult}
					marking={marking}
					onMarkPresent={handleMarkPresent}
					onClose={() => { setScanResult(null); setLastScannedToken(null); }}
				/>
			)}

			{}
			{showRejectModal && (
				<div
					className="modal d-block"
					style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0, zIndex: 50 }}
					onClick={() => setShowRejectModal(false)}
				>
					<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
						<div className="modal-content rounded-4 border-0 shadow-lg">
							<div className="modal-header border-0 pb-0">
								<h5 className="modal-title fw-bold">Reject Event</h5>
								<button className="btn-close" onClick={() => setShowRejectModal(false)} />
							</div>
							<div className="modal-body">
								<p className="text-body-secondary small mb-3">
									Provide a reason so the organiser knows what to fix before resubmitting.
								</p>
								<textarea
									className="form-control rounded-3"
									rows={3}
									placeholder="e.g. Missing venue details, inappropriate content..."
									value={rejectReasonInput}
									onChange={(e) => setRejectReasonInput(e.target.value)}
									autoFocus
								/>
							</div>
							<div className="modal-footer border-0 pt-0">
								<button
									className="btn btn-outline-secondary rounded-pill px-4"
									onClick={() => {
										setShowRejectModal(false);
										setRejectReasonInput("");
									}}
								>
									Cancel
								</button>
								<button
									className="btn btn-danger rounded-pill px-4"
									onClick={handleReject}
									disabled={adminActing || !rejectReasonInput.trim()}
								>
									{adminActing ? (
										<span className="spinner-border spinner-border-sm me-2" role="status" />
									) : null}
									Confirm Rejection
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
