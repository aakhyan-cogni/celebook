import { motion } from "framer-motion";
import type { EventFormData } from "./constants";
import FieldError from "../../lib/validation/FieldError";
import type { FieldErrors } from "../../lib/validation/useFormErrors";

interface Step2Props {
	visible: boolean;
	formData: EventFormData;
	todayStr: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
	errors?: FieldErrors;
}

export default function Step2Schedule({ visible, formData, todayStr, onChange, errors = {} }: Step2Props) {
	const cls = (name: string) => `form-control form-control-lg rounded-3 shadow-sm${errors[name] ? " is-invalid" : ""}`;
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
						className={cls("date")}
						aria-invalid={!!errors.date}
					/>
					<FieldError message={errors.date} />
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold">Start Time</label>
					<input
						type="time"
						name="time"
						value={formData.time}
						onChange={onChange}
						className={cls("time")}
						aria-invalid={!!errors.time}
					/>
					<FieldError message={errors.time} />
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold">Location</label>
					<input
						type="text"
						name="location"
						value={formData.location}
						onChange={onChange}
						className={cls("location")}
						placeholder="Venue"
						aria-invalid={!!errors.location}
					/>
					<FieldError message={errors.location} />
				</div>
			</div>
		</motion.div>
	);
}
