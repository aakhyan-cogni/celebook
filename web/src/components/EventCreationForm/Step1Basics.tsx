import { motion } from "framer-motion";
import ImageUploadZone from "./ImageUploadZone";
import type { EventFormData } from "./constants";
import { EVENT_CATEGORIES } from "./constants";
import FieldError from "../../lib/validation/FieldError";
import type { FieldErrors } from "../../lib/validation/useFormErrors";

interface Step1Props {
	visible: boolean;
	formData: EventFormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
	imageProps: React.ComponentProps<typeof ImageUploadZone>;
	errors?: FieldErrors;
}

export default function Step1Basics({ visible, formData, onChange, imageProps, errors = {} }: Step1Props) {
	const cls = (name: string, base: string) => `${base}${errors[name] ? " is-invalid" : ""}`;
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
					className={cls("title", "form-control form-control-lg rounded-3 shadow-sm border-light-subtle")}
					placeholder="e.g. Tech Conference 2026"
					value={formData.title}
					onChange={onChange}
					aria-invalid={!!errors.title}
				/>
				<FieldError message={errors.title} />
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label fw-semibold">Category</label>
					<select
						name="category"
						className={cls("category", "form-select form-control-lg rounded-3 shadow-sm")}
						value={formData.category}
						onChange={onChange}
						aria-invalid={!!errors.category}
					>
						{EVENT_CATEGORIES.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<FieldError message={errors.category} />
				</div>
				<div className="col-md-6 mb-3">
					<ImageUploadZone {...imageProps} />
					<FieldError message={errors.imagesCount} />
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label fw-semibold">Description</label>
				<textarea
					name="description"
					className={cls("description", "form-control rounded-3 shadow-sm")}
					value={formData.description}
					onChange={onChange}
					rows={4}
					placeholder="Describe your event..."
					aria-invalid={!!errors.description}
				></textarea>
				<FieldError message={errors.description} />
				<div className="form-text small">{formData.description.trim().length}/5000 characters</div>
			</div>
		</motion.div>
	);
}
