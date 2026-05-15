import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { BASE_URL, getImageUrl, EVENT_FALLBACK_IMG } from "../lib/api";
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
	const [showFormData, setShowFormData] = useState(false);
	const [formData, setFormData] = useState({
		dietaryRestrictions: "",
		emergencyContact: "",
		phone: "",
		notes: "",
	});

	const [eventStatus, setEventStatus] = useState<string>(event.status);
	const [rejectionReason, setRejectionReason] = useState<string>(event.rejectionReason ?? "");
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReasonInput, setRejectReasonInput] = useState("");
	const [adminActing, setAdminActing] = useState(false);

	const isPastEvent = new Date(event.date).getTime() < Date.now();
	const isOrganizer = isAuthenticated && user?.id === event.organizerId;
	const isAdmin = isAuthenticated && user?.role === "ADMIN";

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
	});

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
				body: JSON.stringify({ formData }),
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
			toast.success("Registration successful!");
			setFormData({ dietaryRestrictions: "", emergencyContact: "", phone: "", notes: "" });
			setShowFormData(false);

			setTimeout(() => { onClose?.(); }, 2000);
		} catch (err) {
			console.error("Registration error:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
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

		if (success) {
			return (
				<button className="btn btn-success px-4 fw-bold rounded-pill" disabled>
					 Registered
				</button>
			);
		}

		return (
			<button
				className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm"
				onClick={() => setShowFormData(true)}
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
					src={
						event.imgUrls?.[0]
							? getImageUrl(event.imgUrls[0])
							: EVENT_FALLBACK_IMG
					}
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

					{}
					{!isOrganizer && !isAdmin && !success && showFormData && (
						<div className="card border-0 bg-body-tertiary rounded-4 p-4 mb-4">
							<h5 className="fw-bold mb-3">Complete Registration</h5>
							<div className="mb-3">
								<label className="form-label fw-bold">Dietary Restrictions (Optional)</label>
								<input
									type="text"
									className="form-control"
									placeholder="e.g., Vegetarian, Vegan, No gluten"
									value={formData.dietaryRestrictions}
									onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
								/>
							</div>
							<div className="mb-3">
								<label className="form-label fw-bold">Emergency Contact (Optional)</label>
								<input
									type="text"
									className="form-control"
									placeholder="Contact name"
									value={formData.emergencyContact}
									onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
								/>
							</div>
							<div className="mb-3">
								<label className="form-label fw-bold">Phone Number (Optional)</label>
								<input
									type="tel"
									className="form-control"
									placeholder="+1 (555) 000-0000"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								/>
							</div>
							<div className="mb-3">
								<label className="form-label fw-bold">Notes (Optional)</label>
								<textarea
									className="form-control"
									rows={3}
									placeholder="Any additional information..."
									value={formData.notes}
									onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								/>
							</div>
							<div className="d-flex gap-2">
								<button
									onClick={handleRegister}
									className="btn btn-success fw-bold rounded-pill px-4"
									disabled={loading}
								>
									{loading ? "Registering..." : "Confirm Registration"}
								</button>
								<button
									onClick={() => setShowFormData(false)}
									className="btn btn-outline-secondary fw-bold rounded-pill px-4"
									disabled={loading}
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					<div className="d-flex gap-2 pt-2 flex-wrap">
						{}
						{primaryButton()}

						{}
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
								{["APPROVED", "PENDING"].includes(eventStatus) && !event.isCancelled && !isPastEvent && (
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
											{adminActing ? <span className="spinner-border spinner-border-sm me-1" role="status" /> : null}
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
								onClick={() => document.getElementById("feedback-section")?.scrollIntoView({ behavior: "smooth" })}
							>
								 Leave Feedback
							</button>
						)}
					</div>

					{}
					{(isOrganizer || isAdmin) && (
						<div className="mt-4 p-3 bg-body-tertiary rounded-4 border border-primary border-opacity-10">
							<h6 className="fw-bold small text-primary text-uppercase mb-3">Organizer Panel</h6>
							<div className="row g-3 text-center">
								<div className="col-3">
									<div className="fw-bold fs-5">{event.capacity}</div>
									<div className="small text-body-secondary">Capacity</div>
								</div>
								<div className="col-3">
									<div className="fw-bold fs-5">{event.registrationCount ?? 0}</div>
									<div className="small text-body-secondary">Registered</div>
								</div>
								<div className="col-3">
									<div className="fw-bold fs-5">{event.price === 0 ? "FREE" : `₹${event.price}`}</div>
									<div className="small text-body-secondary">Ticket Price</div>
								</div>
								<div className="col-3">
									<div className="fw-bold fs-5">{event.visibility}</div>
									<div className="small text-body-secondary">Visibility</div>
								</div>
							</div>

						</div>
					)}
				</div>
			</div>

			{}
			{showRejectModal && (
				<div
					className="modal d-block"
					style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0, zIndex: 50 }}
					onClick={() => setShowRejectModal(false)}
				>
					<div
						className="modal-dialog modal-dialog-centered"
						onClick={(e) => e.stopPropagation()}
					>
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
									onClick={() => { setShowRejectModal(false); setRejectReasonInput(""); }}
								>
									Cancel
								</button>
								<button
									className="btn btn-danger rounded-pill px-4"
									onClick={handleReject}
									disabled={adminActing || !rejectReasonInput.trim()}
								>
									{adminActing
										? <span className="spinner-border spinner-border-sm me-2" role="status" />
										: null}
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
