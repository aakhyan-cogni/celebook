import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import { BASE_URL } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TOTAL_STEPS = 4;

const EventCreationForm = () => {
	const [step,          setStep]          = useState(1);
	const [isFree,        setIsFree]        = useState(true);
	const [submitting,    setSubmitting]    = useState(false);
	const [existingEvent, setExistingEvent] = useState<any>(null);

	const navigate       = useNavigate();
	const [searchParams] = useSearchParams();
	const accessToken    = useAuthStore((s) => s.accessToken);
	const userTier       = useAuthStore((s) => s.user?.tier) ?? "FREE";
	const isFreeTier     = userTier === "FREE";

	// Edit mode: /create?edit=<eventId>
	const editId = searchParams.get("edit");

	const [formData, setFormData] = useState({
		title: "",
		category: "Workshop",
		description: "",
		date: "",
		location: "",
		price: 0,
		capacity: 0,
		currency: "INR",
		visibility: "PUBLIC",
		isTeamEvent: false,
		minTeamSize: "",
		maxTeamSize: "",
		teamCapacityMode: "PER_MEMBER",
	});

	// Pre-fill form when editing an existing event
	useEffect(() => {
		if (!editId) return;
		const load = async () => {
			try {
				const headers: HeadersInit = { "Content-Type": "application/json" };
				if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "GET",
					headers,
					credentials: "include",
				});
				if (!res.ok) { toast.error("Could not load event for editing."); return; }
				const ev = await res.json();
				setExistingEvent(ev);
				setFormData({
					title:            ev.title           ?? "",
					category:         ev.category        ?? "Workshop",
					description:      ev.description     ?? "",
					date:             ev.date ? ev.date.slice(0, 10) : "",
					location:         ev.location        ?? "",
					price:            ev.price           ?? 0,
					capacity:         ev.capacity        ?? 0,
					currency:         ev.currency        ?? "INR",
					visibility:       ev.visibility      ?? "PUBLIC",
					isTeamEvent:      ev.isTeamEvent     ?? false,
					minTeamSize:      ev.minTeamSize     ?? "",
					maxTeamSize:      ev.maxTeamSize     ?? "",
					teamCapacityMode: ev.teamCapacityMode ?? "PER_MEMBER",
				});
				setIsFree(ev.price === 0);
			} catch {
				toast.error("Could not load event for editing.");
			}
		};
		load();
	}, [editId]);

	// Step navigation
	const nextStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStep((p) => Math.min(p + 1, TOTAL_STEPS));
	};
	const prevStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStep((p) => Math.max(p - 1, 1));
	};

	// Validation per step
	const isStepValid = () => {
		if (step === 1) return formData.title.trim() !== "" && formData.description.trim() !== "";
		if (step === 2) return formData.date !== "" && formData.location.trim() !== "";
		if (step === 3) return (isFree || Number(formData.price) > 0) && Number(formData.capacity) > 0;
		return true; // step 4 — all optional
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
		}));
	};

	const buildPayload = () => ({
		title:            formData.title,
		category:         formData.category,
		description:      formData.description,
		date:             formData.date,
		location:         formData.location,
		price:            isFree ? 0 : Number(formData.price),
		capacity:         Number(formData.capacity),
		currency:         formData.currency || "INR",
		visibility:       formData.visibility,
		isTeamEvent:      formData.isTeamEvent,
		minTeamSize:      formData.isTeamEvent && formData.minTeamSize ? Number(formData.minTeamSize) : null,
		maxTeamSize:      formData.isTeamEvent && formData.maxTeamSize ? Number(formData.maxTeamSize) : null,
		teamCapacityMode: formData.isTeamEvent ? formData.teamCapacityMode : null,
	});

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization:  `Bearer ${accessToken}`,
	});

	// ── Save as Draft ─────────────────────────────────────────────────────────
	const handleSaveDraft = async (e: React.MouseEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = buildPayload();
			if (editId && existingEvent) {
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "PATCH", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
			} else {
				const res = await fetch(`${BASE_URL}/events`, {
					method: "POST", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
			}
			toast.success("Draft saved.");
			navigate("/dashboard");
		} catch (err: any) {
			toast.error(err?.message || "Could not save draft.");
		} finally {
			setSubmitting(false);
		}
	};

	// ── Publish ───────────────────────────────────────────────────────────────
	const handlePublish = async (e: React.MouseEvent | React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = buildPayload();
			let eventId: string;

			// Step 1: create or update
			if (editId && existingEvent) {
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "PATCH", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				eventId = editId;
			} else {
				const res = await fetch(`${BASE_URL}/events`, {
					method: "POST", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				const created = await res.json();
				eventId = created.id;
			}

			// Step 2: publish
			const pubRes = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			if (!pubRes.ok) {
				const err = await pubRes.json();
				toast.error(
					err.message === "TIER_LIMIT_EXCEEDED"
						? "You've reached your plan's event limit. Upgrade to publish more."
						: err.message || "Could not publish.",
				);
				return;
			}

			const published = await pubRes.json();

			if (published.status === "PENDING") {
				// First-time publisher → admin review required
				toast.success(
					"Your event has been submitted for admin review. You'll be notified once it's approved.",
					{ duration: 7000 },
				);
				navigate("/dashboard");
			} else if (published.status === "APPROVED") {
				// Returning publisher or private event → live immediately
				toast.success("Your event is live! 🎉", { duration: 4000 });
				navigate(`/events/${eventId}`);
			} else {
				toast.success("Event submitted.");
				navigate("/dashboard");
			}
		} catch (err: any) {
			toast.error(err?.message || "Could not publish.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="container py-4 px-0 mx-auto">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					{/* Progress Header */}
					<div className="text-center mb-5">
						<h2 className="fw-bold display-5">
							{editId ? "Edit" : "Create New"}{" "}
							<span className="text-primary text-gradient">Event</span>
						</h2>
						<p className="text-muted">Fill in the details to launch your experience.</p>

						<div className="d-flex justify-content-between mt-4 position-relative px-5">
							{Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
								<div
									key={s}
									className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${
										step >= s
											? "btn-primary text-white bg-primary"
											: "btn-light border text-muted bg-primary-subtle"
									}`}
									style={{ width: "40px", height: "40px", zIndex: 2 }}
								>
									{s}
								</div>
							))}
							<div
								className="progress position-absolute top-50 start-0 translate-middle-y w-100"
								style={{ height: "2px", zIndex: 1 }}
							>
								<div
									className="progress-bar bg-primary transition-all"
									style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
								></div>
							</div>
						</div>
					</div>

					{/* Form Card */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
						className="card border-0 shadow-lg p-4 p-md-5 backdrop-blur rounded-4"
					>
						<form onSubmit={handlePublish}>
							<AnimatePresence>

								{/* ── Step 1: Event Basics (unchanged from original) ── */}
								<motion.div
									key="step1"
									className={step !== 1 ? "d-none" : ""}
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
											onChange={handleChange}
										/>
									</div>
									<div className="row">
										<div className="col-md-6 mb-3">
											<label className="form-label fw-semibold">Category</label>
											<select
												name="category"
												className="form-select form-control-lg rounded-3 shadow-sm"
												value={formData.category}
												onChange={handleChange}
											>
												<option value="Conference">Conference</option>
												<option value="Workshop">Workshop</option>
												<option value="Social">Social</option>
												<option value="Entertainment">Entertainment</option>
												<option value="Health & Wellness">Health & Wellness</option>
												<option value="Education">Education</option>
												<option value="Other">Other</option>
											</select>
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label fw-semibold">Media Upload</label>
											<input
												type="file"
												name="media"
												className="form-control form-control-lg rounded-3 shadow-sm"
											/>
											<div className="form-text">Image upload coming soon.</div>
										</div>
									</div>
									<div className="mb-3">
										<label className="form-label fw-semibold">Description</label>
										<textarea
											name="description"
											className="form-control rounded-3 shadow-sm"
											value={formData.description}
											onChange={handleChange}
											rows={4}
											placeholder="Describe your event..."
										></textarea>
									</div>
								</motion.div>

								{/* ── Step 2: Logistics (unchanged from original) ── */}
								<motion.div
									key="step2"
									className={step !== 2 ? "d-none" : ""}
									initial={{ x: 20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -20, opacity: 0 }}
								>
									<h4 className="fw-bold mb-4">Step 2: Logistics & Features</h4>
									<div className="row mb-3">
										<div className="col-md-6">
											<label className="form-label fw-semibold">Date</label>
											<input
												type="date"
												name="date"
												value={formData.date}
												onChange={handleChange}
												className="form-control form-control-lg rounded-3 shadow-sm"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label fw-semibold">Location</label>
											<input
												type="text"
												name="location"
												value={formData.location}
												onChange={handleChange}
												className="form-control form-control-lg rounded-3 shadow-sm"
												placeholder="Venue or Link"
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
										<div className="form-text text-muted">
											Activates real-time queuing for high-traffic ticket sales.
										</div>
									</div>
								</motion.div>

								{/* ── Step 3: Ticketing (unchanged from original) ── */}
								<motion.div
									key="step3"
									className={step !== 3 ? "d-none" : ""}
									initial={{ x: 20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -20, opacity: 0 }}
								>
									<h4 className="fw-bold mb-4">Step 3: Ticketing & Squad Pay</h4>
									<div className="mb-4">
										<label className="form-label fw-semibold d-block">Is this a free event?</label>
										<div className="btn-group w-100 shadow-sm" role="group">
											<input
												type="radio" className="btn-check" name="free" id="free"
												checked={isFree}
												onChange={() => { setIsFree(true); setFormData((p) => ({ ...p, price: 0 })); }}
											/>
											<label className="btn btn-outline-primary py-2 fw-bold" htmlFor="free">Free Event</label>
											<input
												type="radio" className="btn-check" name="free" id="paid"
												checked={!isFree}
												onChange={() => setIsFree(false)}
											/>
											<label className="btn btn-outline-primary py-2 fw-bold" htmlFor="paid">Paid Event</label>
										</div>
									</div>
									<div className="row mb-4">
										<AnimatePresence>
											{!isFree && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													className="col-md-6 mb-3 overflow-hidden"
												>
													<label className="form-label fw-semibold" htmlFor="price">Ticket Price (INR)</label>
													<div className="input-group">
														<span className="input-group-text border-end-0">₹</span>
														<input
															type="number" id="price" name="price"
															value={formData.price} onChange={handleChange}
															className="form-control form-control-lg rounded-end-3 border-start-0 shadow-sm"
															placeholder="0.00"
														/>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
										<div className={isFree ? "col-md-12" : "col-md-6"}>
											<label className="form-label fw-semibold">Total Capacity</label>
											<input
												type="number" name="capacity"
												value={formData.capacity} onChange={handleChange}
												className="form-control form-control-lg rounded-3 shadow-sm"
												placeholder="e.g. 500"
											/>
										</div>
									</div>
									<div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 mb-4">
										<div className="form-check form-switch">
											<input className="form-check-input" type="checkbox" id="squadPay" defaultChecked />
											<label className="form-check-label fw-bold" htmlFor="squadPay">
												Enable Squad Booking & Split Pay{" "}
												<span className="badge bg-primary ms-2">USP</span>
											</label>
											<p className="small text-muted mb-0">Allow friends to split bills automatically.</p>
										</div>
									</div>
								</motion.div>

								{/* ── Step 4: Visibility & Team Settings (NEW) ── */}
								<motion.div
									key="step4"
									className={step !== 4 ? "d-none" : ""}
									initial={{ x: 20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -20, opacity: 0 }}
								>
									<h4 className="fw-bold mb-4">Step 4: Visibility & Team Settings</h4>

									{/* Visibility selector */}
									<div className="mb-4">
										<label className="form-label fw-semibold">Visibility</label>
										<select
											name="visibility"
											className="form-select form-control-lg rounded-3 shadow-sm"
											value={formData.visibility}
											onChange={(e) => {
												// FREE tier cannot select Private
												if (e.target.value === "PRIVATE" && isFreeTier) return;
												handleChange(e);
											}}
										>
											<option value="PUBLIC">🌍 Public — Listed in search results</option>
											<option value="UNLISTED">🔗 Unlisted — Only accessible via direct link</option>
											<option value="PRIVATE" disabled={isFreeTier}>
												🔒 Private — Only confirmed registrants can view{isFreeTier ? " (PRO only)" : ""}
											</option>
										</select>
										{isFreeTier && (
											<div className="form-text text-warning mt-1">
												🔒 Private visibility is a PRO feature.{" "}
												<a href="/pricing" className="text-warning fw-bold">Upgrade to PRO</a>
											</div>
										)}
										{formData.visibility === "PRIVATE" && !isFreeTier && (
											<div className="form-text text-info mt-1">
												Private events skip admin review and go live immediately.
											</div>
										)}
									</div>

									<hr className="opacity-10 my-4" />

									{/* Team Event toggle — PRO feature */}
									<div className="p-4 bg-body-tertiary rounded-4 border border-primary border-opacity-10">
										<div className="form-check form-switch mb-1">
											<input
												className="form-check-input"
												type="checkbox"
												id="isTeamEvent"
												name="isTeamEvent"
												checked={formData.isTeamEvent}
												disabled={isFreeTier}
												onChange={handleChange}
											/>
											<label className="form-check-label fw-bold" htmlFor="isTeamEvent">
												Team Event{" "}
												<span className="badge bg-primary-subtle text-primary ms-1">PRO</span>
											</label>
											<p className="small text-muted mb-0">Allow group registrations with team size limits.</p>
											{isFreeTier && (
												<div className="form-text text-warning mt-1">
													🔒 Team events require PRO.{" "}
													<a href="/pricing" className="text-warning fw-bold">Upgrade</a>
												</div>
											)}
										</div>

										<AnimatePresence>
											{formData.isTeamEvent && !isFreeTier && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													className="overflow-hidden"
												>
													<div className="row mt-3 g-3">
														<div className="col-md-4">
															<label className="form-label fw-semibold small">Min Team Size</label>
															<input
																type="number" name="minTeamSize"
																value={formData.minTeamSize} onChange={handleChange}
																className="form-control rounded-3" placeholder="e.g. 2" min={1}
															/>
														</div>
														<div className="col-md-4">
															<label className="form-label fw-semibold small">Max Team Size</label>
															<input
																type="number" name="maxTeamSize"
																value={formData.maxTeamSize} onChange={handleChange}
																className="form-control rounded-3" placeholder="e.g. 5" min={1}
															/>
														</div>
														<div className="col-md-4">
															<label className="form-label fw-semibold small">Capacity Mode</label>
															<select
																name="teamCapacityMode"
																className="form-select rounded-3"
																value={formData.teamCapacityMode}
																onChange={handleChange}
															>
																<option value="PER_MEMBER">Per Member</option>
																<option value="PER_TEAM">Per Team</option>
															</select>
														</div>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>

							</AnimatePresence>

							{/* Navigation Buttons */}
							<div className="d-flex justify-content-between mt-5 pt-3 border-top">
								<button
									type="button"
									className={`btn btn-link text-decoration-none fw-bold ${step === 1 ? "invisible" : "text-muted"}`}
									onClick={prevStep}
								>
									← Back
								</button>

								<div className="d-flex gap-2">
									{/* Save as Draft — visible on every step */}
									<button
										type="button"
										className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
										onClick={handleSaveDraft}
										disabled={submitting || !isStepValid()}
									>
										{submitting ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
										💾 Save Draft
									</button>

									{step < TOTAL_STEPS ? (
										<motion.button
											whileTap={isStepValid() ? { scale: 0.95 } : {}}
											type="button"
											className="btn btn-primary px-5 rounded-pill shadow fw-bold"
											onClick={nextStep}
											disabled={!isStepValid()}
										>
											Continue
										</motion.button>
									) : (
										<motion.button
											whileTap={isStepValid() ? { scale: 0.95 } : {}}
											type="submit"
											className="btn btn-success px-5 rounded-pill shadow fw-bold"
											disabled={!isStepValid() || submitting}
										>
											{submitting ? (
												<>
													<span className="spinner-border spinner-border-sm me-2" role="status" />
													Publishing...
												</>
											) : (
												"🚀 Publish Event"
											)}
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
