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
				<div className="col-md-6">
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
				<div className="col-md-6">
					<label className="form-label fw-semibold">Location</label>
					<input
						type="text"
						name="location"
						value={formData.location}
						onChange={onChange}
						className="form-control form-control-lg rounded-3 shadow-sm"
						placeholder="Venue or Link"
					/>
				</div>
			</div>
			
		</motion.div>
	);
}
