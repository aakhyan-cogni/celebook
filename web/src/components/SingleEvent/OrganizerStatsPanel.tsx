import { ScanLine } from "lucide-react";

const STATUS_BADGE_CLASS: Record<string, string> = {
	APPROVED: "bg-success",
	PENDING: "bg-warning text-dark",
	REJECTED: "bg-danger",
	DRAFT: "bg-secondary",
};

const STATUS_LABEL: Record<string, string> = {
	APPROVED: "Approved",
	PENDING: "Under Review",
	REJECTED: "Rejected",
	DRAFT: "Draft",
};

interface OrganizerStatsPanelProps {
	event: any;
	eventStat: any;
	eventStatus: string;
	scanLoading: boolean;
	onScan: () => void;
}

export default function OrganizerStatsPanel({
	event,
	eventStat,
	eventStatus,
	scanLoading,
	onScan,
}: OrganizerStatsPanelProps) {
	return (
		<div className="card border-0 bg-body-tertiary rounded-4 overflow-hidden mt-4">
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
				<span
					className={`badge rounded-pill px-3 py-2 ${STATUS_BADGE_CLASS[eventStatus] ?? "bg-secondary"}`}
					style={{ fontSize: "0.72rem" }}
				>
					{STATUS_LABEL[eventStatus] ?? eventStatus}
				</span>
			</div>

			<div className="p-4">
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

				<div className="d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center gap-2">
						<span className="small text-body-secondary">Visibility</span>
						<span className="badge rounded-pill text-bg-secondary">{event.visibility}</span>
					</div>
					<button
						className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
						onClick={onScan}
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
	);
}
