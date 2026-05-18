import { motion } from "framer-motion";
import ImageUploadZone from "./ImageUploadZone";
import type { EventFormData } from "./constants";

interface Step1Props {
	visible: boolean;
	formData: EventFormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
	imageProps: React.ComponentProps<typeof ImageUploadZone>;
}

export default function Step1Basics({ visible, formData, onChange, imageProps }: Step1Props) {
	return (
		<motion.div
			key="step1"
			className={!visible ? "d-none" : ""}
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
		>
			<h4 className="fw-bold mb-4">Step 1: Event Basics</h4>
			<div className="mb-3">
				<label className="form-label fw-semibold">Event Title</label>
				<input
					name="title"
					type="text"
					className="form-control form-control-lg rounded-3 shadow-sm border-light-subtle"
					placeholder="e.g. Tech Conference 2026"
					value={formData.title}
					onChange={onChange}
				/>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label fw-semibold">Category</label>
					<select
						name="category"
						className="form-select form-control-lg rounded-3 shadow-sm"
						value={formData.category}
						onChange={onChange}
					>
						<option value="Conference">Conference</option>
						<option value="Workshop">Workshop</option>
						<option value="Social">Social</option>
						<option value="Entertainment">Entertainment</option>
						<option value="Health & Wellness">Health &amp; Wellness</option>
						<option value="Education">Education</option>
						<option value="Other">Other</option>
					</select>
				</div>
				<div className="col-md-6 mb-3">
					<ImageUploadZone {...imageProps} />
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label fw-semibold">Description</label>
				<textarea
					name="description"
					className="form-control rounded-3 shadow-sm"
					value={formData.description}
					onChange={onChange}
					rows={4}
					placeholder="Describe your event..."
				></textarea>
			</div>
		</motion.div>
	);
}
