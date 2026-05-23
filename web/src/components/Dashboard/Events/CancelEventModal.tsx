import { motion } from "framer-motion";

interface CancelEventModalProps {
	target: any;
	reason: string;
	cancelling: boolean;
	onReasonChange: (v: string) => void;
	onConfirm: () => void;
	onClose: () => void;
}

export default function CancelEventModal({
	target,
	reason,
	cancelling,
	onReasonChange,
	onConfirm,
	onClose,
}: CancelEventModalProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="modal d-block"
			style={{ background: "rgba(0,0,0,0.5)" }}
			onClick={onClose}
		>
			<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content rounded-4 border-0 shadow-lg">
					<div className="modal-header border-0 pb-0">
						<h5 className="modal-title fw-bold">Cancel Event?</h5>
						<button className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<p className="text-body-secondary">
							Are you sure you want to cancel <strong>{target?.title}</strong>? Registered attendees will
							be notified.
						</p>
						<div className="mb-2">
							<label className="form-label fw-semibold small">Reason (optional)</label>
							<textarea
								className={`form-control rounded-3${reason.length > 500 ? " is-invalid" : ""}`}
								rows={3}
								placeholder="e.g. Venue unavailable, rescheduled..."
								value={reason}
								onChange={(e) => onReasonChange(e.target.value)}
								maxLength={500}
								aria-invalid={reason.length > 500}
							/>
							{reason.length > 500 && (
								<div className="invalid-feedback d-block">Reason must be 500 characters or less.</div>
							)}
							<div className="text-end small text-body-secondary mt-1">{reason.length}/500</div>
						</div>
					</div>
					<div className="modal-footer border-0 pt-0">
						<button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
							Keep Event
						</button>
						<button className="btn btn-danger rounded-pill px-4" onClick={onConfirm} disabled={cancelling}>
							{cancelling ? (
								<span className="spinner-border spinner-border-sm me-2" role="status" />
							) : null}
							Cancel Event
						</button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
