import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { EventCard } from "../../EventCard";
import { useDashboardEvents } from "./useDashboardEvents";
import EventActionButtons from "./EventActionButtons";
import DeleteEventModal from "./DeleteEventModal";
import CancelEventModal from "./CancelEventModal";

type StatusFilter = "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function Events() {
	const navigate = useNavigate();
	const { myEvents, loading, publish, remove, cancel, duplicate } = useDashboardEvents();

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<StatusFilter>("ALL");

	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);

	const [cancelTarget, setCancelTarget] = useState<any>(null);
	const [cancelReason, setCancelReason] = useState("");
	const [cancelling, setCancelling] = useState(false);

	const goToEdit = (event: any) => {
		navigate(`/create?edit=${event.id}`, { state: { eventData: event } });
	};

	const onConfirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		const ok = await remove(deleteTarget);
		setDeleting(false);
		if (ok) setDeleteTarget(null);
	};

	const onConfirmCancel = async () => {
		if (!cancelTarget) return;
		setCancelling(true);
		const ok = await cancel(cancelTarget, cancelReason);
		setCancelling(false);
		if (ok) {
			setCancelTarget(null);
			setCancelReason("");
		}
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
										<EventActionButtons
											event={event}
											onEdit={goToEdit}
											onPublish={publish}
											onDuplicate={duplicate}
											onAskDelete={setDeleteTarget}
											onAskCancel={(ev) => { setCancelTarget(ev); setCancelReason(""); }}
										/>
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

			<AnimatePresence>
				{deleteTarget && (
					<DeleteEventModal
						target={deleteTarget}
						deleting={deleting}
						onConfirm={onConfirmDelete}
						onClose={() => setDeleteTarget(null)}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{cancelTarget && (
					<CancelEventModal
						target={cancelTarget}
						reason={cancelReason}
						cancelling={cancelling}
						onReasonChange={setCancelReason}
						onConfirm={onConfirmCancel}
						onClose={() => setCancelTarget(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
