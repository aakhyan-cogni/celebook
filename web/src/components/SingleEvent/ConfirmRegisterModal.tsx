import { motion } from "motion/react";

interface ConfirmRegisterModalProps {
	event: any;
	loading: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

export default function ConfirmRegisterModal({ event, loading, onConfirm, onClose }: ConfirmRegisterModalProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
			style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
			onClick={() => !loading && onClose()}
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
					<p className="fw-bold mt-2 mb-0">{event.price === 0 ? "FREE" : `₹${event.price}`}</p>
				</div>
				<div className="d-flex gap-2 justify-content-center">
					<button
						onClick={onConfirm}
						className="btn btn-success fw-bold rounded-pill px-4"
						disabled={loading}
					>
						{loading ? "Confirming..." : "Confirm"}
					</button>
					<button
						onClick={onClose}
						className="btn btn-outline-secondary fw-bold rounded-pill px-4"
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
