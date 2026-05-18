import { motion } from "framer-motion";

interface DeleteEventModalProps {
	target: any;
	deleting: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

export default function DeleteEventModal({ target, deleting, onConfirm, onClose }: DeleteEventModalProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
			className="modal d-block"
			style={{ background: "rgba(0,0,0,0.5)" }}
			onClick={onClose}
		>
			<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content rounded-4 border-0 shadow-lg">
					<div className="modal-header border-0 pb-0">
						<h5 className="modal-title fw-bold">Delete Event?</h5>
						<button className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<p className="text-body-secondary">
							Are you sure you want to permanently delete{" "}
							<strong>{target?.title}</strong>? This cannot be undone.
						</p>
					</div>
					<div className="modal-footer border-0 pt-0">
						<button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
							Cancel
						</button>
						<button className="btn btn-danger rounded-pill px-4" onClick={onConfirm} disabled={deleting}>
							{deleting ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
							Delete
						</button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
