import { AnimatePresence, motion } from "motion/react";
import { X, CheckCircle, UserCheck } from "lucide-react";
import { getImageUrl } from "../lib/api";
import type { CheckInResult } from "../lib/api";

interface ParticipantCardProps {
	result: CheckInResult;
	onMarkPresent: () => void;
	onClose: () => void;
	marking?: boolean;
}

export default function ParticipantCard({ result, onMarkPresent, onClose, marking = false }: ParticipantCardProps) {
	const { alreadyPresent, registration } = result;
	const participant = registration.userId;
	const formData = registration.formData ?? {};
	const formEntries = Object.entries(formData).filter(([, v]) => v !== undefined && v !== "");

	const avatarUrl = getImageUrl(`uploads/avatars/${participant.avatar}`);
	const initials = participant.name?.charAt(0).toUpperCase() ?? "?";

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1060,
					backgroundColor: "rgba(0,0,0,0.65)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "1rem",
				}}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ duration: 0.2 }}
					onClick={(e) => e.stopPropagation()}
					className="card border-0 shadow-lg rounded-4 overflow-hidden"
					style={{ width: "100%", maxWidth: 440 }}
				>
					{/* Header */}
					<div className="card-header border-0 d-flex justify-content-between align-items-center py-3 px-4 bg-dark text-white">
						<div className="d-flex align-items-center gap-2">
							<UserCheck size={18} />
							<span className="fw-semibold">Participant</span>
						</div>
						<button
							className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-1"
							style={{ width: 32, height: 32 }}
							onClick={onClose}
						>
							<X size={16} />
						</button>
					</div>

					{/* Participant info */}
					<div className="card-body px-4 py-4">
						<div className="d-flex align-items-center gap-3 mb-4">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt={participant.name}
									className="rounded-circle object-fit-cover flex-shrink-0"
									style={{ width: 56, height: 56 }}
								/>
							) : (
								<div
									className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
									style={{ width: 56, height: 56, background: "#6366f1", fontSize: 22 }}
								>
									{initials}
								</div>
							)}
							<div>
								<div className="fw-bold fs-5">{participant.name}</div>
								<div className="text-secondary small">{participant.email}</div>
							</div>
						</div>

						{/* Attendance status */}
						{alreadyPresent && (
							<div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3 rounded-3">
								<CheckCircle size={16} />
								<span className="small fw-semibold">Already marked present</span>
							</div>
						)}

						{/* Form data */}
						{formEntries.length > 0 && (
							<div className="mb-3">
								<div className="text-muted small fw-semibold mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
									Registration Details
								</div>
								<div className="d-flex flex-column gap-1">
									{formEntries.map(([key, value]) => (
										<div key={key} className="d-flex gap-2 small">
											<span className="text-secondary text-capitalize">{key.replace(/_/g, " ")}:</span>
											<span className="fw-medium">{String(value)}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Footer actions */}
					<div className="card-footer border-0 bg-transparent px-4 pb-4 d-flex gap-2">
						<button
							className="btn btn-success rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-2"
							onClick={onMarkPresent}
							disabled={alreadyPresent || marking}
						>
							{marking ? (
								<span className="spinner-border spinner-border-sm" role="status" />
							) : (
								<CheckCircle size={16} />
							)}
							{alreadyPresent ? "Already Present" : "Mark Present"}
						</button>
						<button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
							Cancel
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
