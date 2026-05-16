import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { EventCard } from "../EventCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import { BASE_URL } from "../../lib/api";
import toast from "react-hot-toast";

type StatusFilter = "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function Events() {
	const navigate        = useNavigate();
	const accessToken     = useAuthStore((s) => s.accessToken);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const [myEvents, setMyEvents] = useState<any[]>([]);
	const [loading,  setLoading]  = useState(true);
	const [search,   setSearch]   = useState("");
	const [status,   setStatus]   = useState<StatusFilter>("ALL");

	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [deleting,     setDeleting]     = useState(false);

	const [cancelTarget, setCancelTarget] = useState<any>(null);
	const [cancelReason, setCancelReason] = useState("");
	const [cancelling,   setCancelling]   = useState(false);

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization:  `Bearer ${accessToken}`,
	});

	const fetchMyEvents = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${BASE_URL}/events/mine`, {
				method: "GET",
				headers: authHeaders(),
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load");
			const data = await res.json();
			setMyEvents(Array.isArray(data) ? data : (data.events ?? []));
		} catch {
			toast.error("Could not load your events.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Wait for hydration: accessToken is briefly null on page refresh while
		// /auth/refresh runs.
		if (isAuthenticated && !accessToken) {
			setLoading(true);
			return;
		}
		if (!accessToken) return;
		fetchMyEvents();
	}, [accessToken, isAuthenticated]);

	const handlePublish = async (eventId: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(
					data.message === "TIER_LIMIT_EXCEEDED"
						? "You've reached your plan's event limit. Upgrade to publish more."
						: data.message || "Could not publish.",
				);
				return;
			}
			if (data.status === "PENDING") {
				toast.success("Submitted for review. You'll be notified when approved.", { duration: 5000 });
			} else if (data.status === "APPROVED") {
				toast.success("Event is live! 🎉");
			}
			fetchMyEvents();
		} catch {
			toast.error("Could not publish event.");
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			const res = await fetch(`${BASE_URL}/events/${deleteTarget.id}`, {
				method: "DELETE", headers: authHeaders(), credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(
					data.message === "HAS_REGISTRATIONS"
						? "This event has registered attendees and cannot be deleted."
						: data.message || "Could not delete.",
				);
				return;
			}
			toast.success("Event deleted.");
			setDeleteTarget(null);
			fetchMyEvents();
		} catch {
			toast.error("Could not delete event.");
		} finally {
			setDeleting(false);
		}
	};

	const handleCancel = async () => {
		if (!cancelTarget) return;
		setCancelling(true);
		try {
			const res = await fetch(`${BASE_URL}/events/${cancelTarget.id}/cancel`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify({ reason: cancelReason.trim() || null }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast.success("Event cancelled.");
			setCancelTarget(null);
			setCancelReason("");
			fetchMyEvents();
		} catch (err: any) {
			toast.error(err?.message || "Could not cancel event.");
		} finally {
			setCancelling(false);
		}
	};

	const handleDuplicate = async (eventId: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eventId}/duplicate`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			if (!res.ok) throw new Error();
			toast.success("Event duplicated as a new draft.");
			fetchMyEvents();
		} catch {
			toast.error("Could not duplicate event.");
		}
	};

	const goToEdit = (event: any) => {
		navigate(`/create?edit=${event.id}`, { state: { eventData: event } });
	};

	const displayEvents = useMemo(() => {
		const term = search.trim().toLowerCase();
		return myEvents.filter((ev) => {
			if (status === "CANCELLED") {
				if (!ev.isCancelled) return false;
			} else if (status !== "ALL") {
				if (ev.isCancelled || ev.status !== status) return false;
			}
			if (!term) return true;
			const haystack = [ev.title, ev.description, ev.category, ev.location, ev.organizerEmail]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(term);
		});
	}, [myEvents, search, status]);

	const actionButtons = (event: any) => {
		if (event.isCancelled) return null;

		return (
			<div className="d-flex gap-1 flex-wrap mt-2">
				{event.status === "DRAFT" && (
					<>
						<button
							className="btn btn-sm btn-outline-primary rounded-pill"
							onClick={(e) => { e.stopPropagation(); goToEdit(event); }}
						>
							Edit
						</button>
						<button
							className="btn btn-sm btn-success rounded-pill"
							onClick={(e) => { e.stopPropagation(); handlePublish(event.id); }}
						>
							Publish
						</button>
						<button
							className="btn btn-sm btn-outline-secondary rounded-pill"
							onClick={(e) => { e.stopPropagation(); handleDuplicate(event.id); }}
						>
							Duplicate
						</button>
						<button
							className="btn btn-sm btn-outline-danger rounded-pill"
							onClick={(e) => { e.stopPropagation(); setDeleteTarget(event); }}
						>
							Delete
						</button>
					</>
				)}

				{event.status === "PENDING" && (
					<>
						<span className="small text-muted fst-italic align-self-center">
							Awaiting admin review — editing locked
						</span>
						<button
							className="btn btn-sm btn-outline-danger rounded-pill"
							onClick={(e) => { e.stopPropagation(); setCancelTarget(event); setCancelReason(""); }}
						>
							Cancel Event
						</button>
					</>
				)}

				{event.status === "APPROVED" && (
					<>
						<button
							className="btn btn-sm btn-outline-secondary rounded-pill"
							onClick={(e) => { e.stopPropagation(); handleDuplicate(event.id); }}
						>
							Duplicate
						</button>
						<button
							className="btn btn-sm btn-outline-danger rounded-pill"
							onClick={(e) => { e.stopPropagation(); setCancelTarget(event); setCancelReason(""); }}
						>
							Cancel Event
						</button>
					</>
				)}

				{event.status === "REJECTED" && (
					<>
						<button
							className="btn btn-sm btn-primary rounded-pill"
							onClick={(e) => { e.stopPropagation(); goToEdit(event); }}
						>
							Edit & Resubmit
						</button>
						<button
							className="btn btn-sm btn-outline-danger rounded-pill"
							onClick={(e) => { e.stopPropagation(); setDeleteTarget(event); }}
						>
							Delete
						</button>
					</>
				)}
			</div>
		);
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center p-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
					<h3 className="fw-bold mb-0">Your Events</h3>
					<div className="d-flex gap-2 align-items-center flex-wrap">
						<input
							className="form-control w-auto"
							type="search"
							placeholder="Search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<select
							className="form-select w-auto"
							value={status}
							onChange={(e) => setStatus(e.target.value as StatusFilter)}
						>
							<option value="ALL">All statuses</option>
							<option value="DRAFT">Draft</option>
							<option value="PENDING">Pending Review</option>
							<option value="APPROVED">Approved</option>
							<option value="REJECTED">Rejected</option>
							<option value="CANCELLED">Cancelled</option>
						</select>
						<motion.button
							whileTap={{ scale: 0.95 }}
							className="btn btn-primary rounded-pill px-3 fw-bold"
							onClick={() => navigate("/create")}
						>
							+ New
						</motion.button>
					</div>
				</div>

				{displayEvents.length > 0 ? (
					<div className="row g-4">
						{displayEvents.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<div className="position-relative">
									{event.registrationCount > 0 && (
										<div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
											<span className="badge bg-info text-dark fs-6 rounded-2 px-3 py-1">
												👥 {event.registrationCount}
											</span>
										</div>
									)}
									<EventCard
										event={event}
										eventStatus
										onClick={() => navigate(`/events/${event.id}`, { state: { eventData: event } })}
									/>
									{event.status === "REJECTED" && event.rejectionReason && (
										<div className="mt-1 px-2">
											<small className="text-danger">
												Rejected: {event.rejectionReason}
											</small>
										</div>
									)}
									<div className="px-2 pb-2">
										{actionButtons(event)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">
							{myEvents.length === 0
								? "You haven't created any events yet."
								: "No events match the current filters."}
						</p>
					</div>
				)}
			</section>

			{/* Delete confirmation modal */}
			<AnimatePresence>
				{deleteTarget && (
					<motion.div
						initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						className="modal d-block"
						style={{ background: "rgba(0,0,0,0.5)" }}
						onClick={() => setDeleteTarget(null)}
					>
						<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
							<div className="modal-content rounded-4 border-0 shadow-lg">
								<div className="modal-header border-0 pb-0">
									<h5 className="modal-title fw-bold">Delete Event?</h5>
									<button className="btn-close" onClick={() => setDeleteTarget(null)} />
								</div>
								<div className="modal-body">
									<p className="text-body-secondary">
										Are you sure you want to permanently delete{" "}
										<strong>{deleteTarget?.title}</strong>? This cannot be undone.
									</p>
								</div>
								<div className="modal-footer border-0 pt-0">
									<button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setDeleteTarget(null)}>
										Cancel
									</button>
									<button className="btn btn-danger rounded-pill px-4" onClick={handleDelete} disabled={deleting}>
										{deleting ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
										Delete
									</button>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Cancel confirmation modal */}
			<AnimatePresence>
				{cancelTarget && (
					<motion.div
						initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						className="modal d-block"
						style={{ background: "rgba(0,0,0,0.5)" }}
						onClick={() => setCancelTarget(null)}
					>
						<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
							<div className="modal-content rounded-4 border-0 shadow-lg">
								<div className="modal-header border-0 pb-0">
									<h5 className="modal-title fw-bold">Cancel Event?</h5>
									<button className="btn-close" onClick={() => setCancelTarget(null)} />
								</div>
								<div className="modal-body">
									<p className="text-body-secondary">
										Are you sure you want to cancel <strong>{cancelTarget?.title}</strong>?
										Registered attendees will be notified.
									</p>
									<div className="mb-2">
										<label className="form-label fw-semibold small">Reason (optional)</label>
										<textarea
											className="form-control rounded-3" rows={3}
											placeholder="e.g. Venue unavailable, rescheduled..."
											value={cancelReason}
											onChange={(e) => setCancelReason(e.target.value)}
										/>
									</div>
								</div>
								<div className="modal-footer border-0 pt-0">
									<button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setCancelTarget(null)}>
										Keep Event
									</button>
									<button className="btn btn-danger rounded-pill px-4" onClick={handleCancel} disabled={cancelling}>
										{cancelling ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
										Cancel Event
									</button>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
