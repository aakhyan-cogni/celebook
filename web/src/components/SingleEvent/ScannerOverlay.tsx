import { motion } from "motion/react";
import { ScanLine, X } from "lucide-react";

interface ScannerOverlayProps {
	onClose: () => void;
}

export default function ScannerOverlay({ onClose }: ScannerOverlayProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1050,
				backgroundColor: "rgba(0,0,0,0.75)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
			}}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				onClick={(e) => e.stopPropagation()}
				className="card border-0 shadow-lg rounded-4 overflow-hidden"
				style={{ width: "100%", maxWidth: 400 }}
			>
				<div className="card-header border-0 d-flex justify-content-between align-items-center py-3 px-4 bg-dark text-white">
					<div className="d-flex align-items-center gap-2">
						<ScanLine size={18} />
						<span className="fw-semibold">Scan Attendee QR</span>
					</div>
					<button
						className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-1"
						style={{ width: 32, height: 32 }}
						onClick={onClose}
					>
						<X size={16} />
					</button>
				</div>
				<div className="card-body p-0">
					<div id="qr-reader-se" style={{ width: "100%" }} />
				</div>
				<div className="card-footer border-0 bg-transparent text-center py-3">
					<small className="text-secondary">Point the camera at the attendee's QR code</small>
				</div>
			</motion.div>
		</motion.div>
	);
}
