import { useEffect, useState } from "react";
import { getImageUrl } from "../../lib/api";
import { getEventRegistrations, type EventRegistration } from "../../api/registration.api";

interface PresentAttendeesModalProps {
	eventId: string;
	onClose: () => void;
}

function formatCheckInTime(iso: string | null): string {
	if (!iso) return "";
	const d = new Date(iso);
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function PresentAttendeesModal({ eventId, onClose }: PresentAttendeesModalProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [attendees, setAttendees] = useState<EventRegistration[]>([]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const all = await getEventRegistrations(eventId);
				if (cancelled) return;
				setAttendees(all.filter((r) => r.attendanceStatus === "PRESENT"));
			} catch (e) {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Failed to load attendees");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [eventId]);

	return (
		<div
			className="modal d-block"
			style={{ background: "rgba(0,0,0,0.5)", position: "fixed", inset: 0, zIndex: 1055 }}
			onClick={onClose}
		>
			<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content rounded-4 border-0 shadow-lg">
					<div className="modal-header border-0 pb-0">
						<div>
							<h5 className="modal-title fw-bold mb-0">Present Attendees</h5>
							<div className="small text-body-secondary">
								{loading ? "Loading…" : `${attendees.length} checked in`}
							</div>
						</div>
						<button className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body" style={{ maxHeight: "60vh" }}>
						{loading && (
							<div className="d-flex justify-content-center py-4">
								<span className="spinner-border" role="status" />
							</div>
						)}
						{!loading && error && (
							<div className="alert alert-danger rounded-3 small mb-0">{error}</div>
						)}
						{!loading && !error && attendees.length === 0 && (
							<div className="text-center text-body-secondary py-4 small">
								No attendees have been checked in yet.
							</div>
						)}
						{!loading && !error && attendees.length > 0 && (
							<ul className="list-unstyled mb-0">
								{attendees.map((reg) => {
									const avatarSrc = reg.userId.avatar
										? getImageUrl(`/uploads/avatars/${reg.userId.avatar}`)
										: getImageUrl("/uploads/avatars/default.png");
									return (
										<li
											key={reg._id}
											className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary border-opacity-10"
										>
											<img
												src={avatarSrc}
												alt={reg.userId.name}
												width={40}
												height={40}
												className="rounded-circle object-fit-cover flex-shrink-0"
												style={{ objectFit: "cover" }}
											/>
											<div className="flex-grow-1 min-w-0">
												<div className="fw-semibold text-truncate">{reg.userId.name}</div>
												<div className="small text-body-secondary text-truncate">{reg.userId.email}</div>
											</div>
											<div className="text-end flex-shrink-0">
												<span className="badge rounded-pill text-bg-success-subtle text-success border border-success-subtle">
													Present
												</span>
												{reg.checkedInAt && (
													<div className="small text-body-secondary mt-1">
														{formatCheckInTime(reg.checkedInAt)}
													</div>
												)}
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>
					<div className="modal-footer border-0 pt-0">
						<button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
