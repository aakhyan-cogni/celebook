import { motion } from "framer-motion";
import type { EventFormData } from "./constants";

interface Step2Props {
	visible: boolean;
	formData: EventFormData;
	todayStr: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function Step2Schedule({ visible, formData, todayStr, onChange }: Step2Props) {
	return (
		<motion.div
			key="step2"
			className={!visible ? "d-none" : ""}
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
		>
			<h4 className="fw-bold mb-4">Step 2: Logistics &amp; Features</h4>
			<div className="row mb-3">
				<div className="col-md-4">
					<label className="form-label fw-semibold">Date</label>
					<input
						type="date"
						name="date"
						value={formData.date}
						onChange={onChange}
						min={todayStr}
						className="form-control form-control-lg rounded-3 shadow-sm"
					/>
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold">Start Time</label>
					<input
						type="time"
						name="time"
						value={formData.time}
						onChange={onChange}
						className="form-control form-control-lg rounded-3 shadow-sm"
					/>
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold">Location</label>
					<input
						type="text"
						name="location"
						value={formData.location}
						onChange={onChange}
						className="form-control form-control-lg rounded-3 shadow-sm"
						placeholder="Venue"
					/>
				</div>
			</div>
			<hr className="my-4 opacity-10" />
			<div className="form-check form-switch mb-3">
				<input className="form-check-input" type="checkbox" id="waitingRoom" />
				<label className="form-check-label fw-bold" htmlFor="waitingRoom">
					Enable Mega-Event Virtual Waiting Room{" "}
					<span className="badge bg-info-subtle text-info ms-2">USP</span>
				</label>
				<div className="form-text text-muted">Activates real-time queuing for high-traffic ticket sales.</div>
			</div>
		</motion.div>
	);
}
