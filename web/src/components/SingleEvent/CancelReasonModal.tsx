interface CancelReasonModalProps {
	value: string;
	acting: boolean;
	onChange: (v: string) => void;
	onClose: () => void;
	onConfirm: () => void;
}

export default function CancelReasonModal({
	value,
	acting,
	onChange,
	onClose,
	onConfirm,
}: CancelReasonModalProps) {
	return (
		<div
			className="modal d-block"
			style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0, zIndex: 50 }}
			onClick={onClose}
		>
			<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content rounded-4 border-0 shadow-lg">
					<div className="modal-header border-0 pb-0">
						<h5 className="modal-title fw-bold">Cancel Event</h5>
						<button className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<p className="text-body-secondary small mb-3">
							Provide a reason for cancellation. This cannot be undone.
						</p>
						<textarea
							className="form-control rounded-3"
							rows={3}
							placeholder="e.g. Venue unavailable, insufficient registrations..."
							value={value}
							onChange={(e) => onChange(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="modal-footer border-0 pt-0">
						<button
							className="btn btn-outline-secondary rounded-pill px-4"
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							className="btn btn-danger rounded-pill px-4"
							onClick={onConfirm}
							disabled={acting || !value.trim()}
						>
							{acting ? (
								<span className="spinner-border spinner-border-sm me-2" role="status" />
							) : null}
							Confirm Cancellation
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}