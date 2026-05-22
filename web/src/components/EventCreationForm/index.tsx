import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { fadeInUp, TOTAL_STEPS, TIER_IMAGE_LIMITS } from "./constants";
import { useEventFormData } from "./useEventFormData";
import { useEventImages } from "./useEventImages";
import { useSaveEvent } from "./useSaveEvent";
import Step1Basics from "./Step1Basics";
import Step2Schedule from "./Step2Schedule";
import Step3Pricing from "./Step3Pricing";
import { eventStep1Schema, eventStep2Schema, eventStep3Schema } from "../../lib/validation/schemas";
import { useFormErrors, type FieldErrors } from "../../lib/validation/useFormErrors";

const EventCreationForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const accessToken = useAuthStore((s) => s.accessToken);
	const userTier = useAuthStore((s) => s.user?.tier) ?? "FREE";
	const imageLimit = TIER_IMAGE_LIMITS[userTier] ?? 1;

	const editId = searchParams.get("edit");
	const autoPublish = searchParams.get("publish") === "1";

	const {
		formData, setFormData,
		isFree, setIsFree,
		existingEvent,
		existingUrls, setExistingUrls,
		step, setStep,
	} = useEventFormData({ editId, autoPublish, location, accessToken });

	const images = useEventImages({
		imageLimit, userTier, accessToken, existingUrls, setExistingUrls,
	});

	const { submitting, handleSaveDraft, handlePublish, todayStr } = useSaveEvent({
		formData, isFree, editId, existingEvent, accessToken,
		uploadImages: images.uploadImages, navigate,
	});

	const step1Errors = useFormErrors(eventStep1Schema);
	const step2Errors = useFormErrors(eventStep2Schema);
	const step3Errors = useFormErrors(eventStep3Schema);

	const stepPayloads = useMemo(() => ({
		1: {
			title: formData.title,
			category: formData.category,
			description: formData.description,
			imagesCount: images.totalImageCount,
		},
		2: { date: formData.date, time: formData.time, location: formData.location },
		3: { price: isFree ? 0 : formData.price, capacity: formData.capacity },
	}), [formData, isFree, images.totalImageCount]);

	const validateStep = (s: number): { ok: boolean; errors: FieldErrors } => {
		if (s === 1) {
			const r = step1Errors.validate(stepPayloads[1]);
			return { ok: r.ok, errors: r.ok ? {} : r.errors };
		}
		if (s === 2) {
			const r = step2Errors.validate(stepPayloads[2]);
			return { ok: r.ok, errors: r.ok ? {} : r.errors };
		}
		if (s === 3) {
			// In free-tier mode price is auto-zero; in paid mode require >=1.
			const payload = { ...stepPayloads[3], price: isFree ? 0 : Math.max(1, formData.price) };
			// Adjust min price for paid events.
			if (!isFree && (!formData.price || formData.price < 1)) {
				step3Errors.setError("price", "Ticket price must be at least 1");
				return { ok: false, errors: { price: "Ticket price must be at least 1" } };
			}
			const r = step3Errors.validate(payload);
			return { ok: r.ok, errors: r.ok ? {} : r.errors };
		}
		return { ok: true, errors: {} };
	};

	const nextStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const { ok } = validateStep(step);
		if (!ok) {
			toast.error("Please fix the highlighted fields");
			return;
		}
		setStep((p) => Math.min(p + 1, TOTAL_STEPS));
	};

	const prevStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStep((p) => Math.max(p - 1, 1));
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
		}));
		if (step === 1) step1Errors.clear(name);
		else if (step === 2) step2Errors.clear(name);
		else if (step === 3) step3Errors.clear(name);
	};

	const onPublishGuarded = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const r1 = step1Errors.validate(stepPayloads[1]);
		const r2 = step2Errors.validate(stepPayloads[2]);
		const r3 = validateStep(3);
		if (!r1.ok) { setStep(1); toast.error("Please fix Step 1 errors"); return; }
		if (!r2.ok) { setStep(2); toast.error("Please fix Step 2 errors"); return; }
		if (!r3.ok) { setStep(3); toast.error("Please fix Step 3 errors"); return; }
		handlePublish(e);
	};

	const onSaveDraftGuarded = (e: React.MouseEvent) => {
		// Drafts require only a non-empty title; everything else is optional.
		if (!formData.title.trim()) {
			step1Errors.setError("title", "Title is required to save a draft");
			setStep(1);
			toast.error("Add a title before saving a draft");
			return;
		}
		handleSaveDraft(e);
	};

	const imageProps = {
		totalImageCount: images.totalImageCount,
		imageLimit,
		userTier,
		imageFiles: images.imageFiles,
		imagePreviews: images.imagePreviews,
		existingUrls,
		imageError: images.imageError,
		uploading: images.uploading,
		fileInputRef: images.fileInputRef,
		editId,
		onSelect: images.handleImageSelect,
		onRemoveNew: images.removeNewImage,
		onRemoveExisting: images.removeExistingImage,
	};

	return (
		<div className="container py-4 px-0 mx-auto">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					<div className="text-center mb-5">
						<h2 className="fw-bold display-5">
							{editId ? "Edit" : "Create New"}{" "}
							<span className="text-primary text-gradient">Event</span>
						</h2>
						<p className="text-muted">Fill in the details to launch your experience.</p>

						{autoPublish && (
							<div className="alert alert-info rounded-3 small py-2 px-3 mt-2">
								Review the settings below and click <strong>Publish Event</strong> on step 3.
							</div>
						)}

						<div className="d-flex justify-content-between mt-4 position-relative px-5">
							{Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
								<div
									key={s}
									className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${step >= s ? "btn-primary text-white bg-primary" : "btn-light border text-muted bg-primary-subtle"}`}
									style={{ width: "40px", height: "40px", zIndex: 2 }}
								>
									{s}
								</div>
							))}
							<div className="progress position-absolute top-50 start-0 translate-middle-y w-100" style={{ height: "2px", zIndex: 1 }}>
								<div className="progress-bar bg-primary transition-all" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
							</div>
						</div>
					</div>

					<motion.div initial="hidden" animate="visible" variants={fadeInUp} className="card border-0 shadow-lg p-4 p-md-5 backdrop-blur rounded-4">
						<form onSubmit={onPublishGuarded} noValidate>
							<AnimatePresence>
								<Step1Basics visible={step === 1} formData={formData} onChange={handleChange} imageProps={imageProps} errors={step1Errors.errors} />
								<Step2Schedule visible={step === 2} formData={formData} todayStr={todayStr} onChange={handleChange} errors={step2Errors.errors} />
								<Step3Pricing
									visible={step === 3}
									formData={formData}
									isFree={isFree}
									setIsFree={setIsFree}
									setFormData={setFormData}
									onChange={handleChange}
									errors={step3Errors.errors}
								/>
							</AnimatePresence>

							<div className="d-flex justify-content-between mt-5 pt-3 border-top">
								<button type="button" className={`btn btn-link text-decoration-none fw-bold ${step === 1 ? "invisible" : "text-muted"}`} onClick={prevStep}>
									← Back
								</button>
								<div className="d-flex gap-2">
									<button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={onSaveDraftGuarded} disabled={submitting || images.uploading}>
										{submitting ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
										Save Draft
									</button>
									{step < TOTAL_STEPS ? (
										<motion.button whileTap={{ scale: 0.95 }} type="button" className="btn btn-primary px-5 rounded-pill shadow fw-bold" onClick={nextStep}>
											Continue
										</motion.button>
									) : (
										<motion.button whileTap={{ scale: 0.95 }} type="submit" className="btn btn-success px-5 rounded-pill shadow fw-bold" disabled={submitting || images.uploading}>
											{submitting || images.uploading
												? <><span className="spinner-border spinner-border-sm me-2" role="status" />{images.uploading ? "Uploading..." : "Publishing..."}</>
												: "Publish Event"
											}
										</motion.button>
									)}
								</div>
							</div>
						</form>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default EventCreationForm;
