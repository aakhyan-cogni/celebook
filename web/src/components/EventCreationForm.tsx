import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalDB } from "../store";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EventCreationForm = () => {
	const [step, setStep] = useState(1);
	const [isFree, setIsFree] = useState(true);
	const addEvent = useLocalDB((s) => s.addEvent);
	const navigate = useNavigate();

	const nextStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStep((prev) => prev + 1);
	};
	const prevStep = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStep((prev) => prev - 1);
	};

	const [formData, setFormData] = useState({
		title: "",
		category: "Workshop",
		description: "",
		date: "",
		location: "",
		price: 0,
		capacity: 0,
	});

	const isStepValid = () => {
		if (step === 1) {
			return formData.title.trim() !== "" && formData.description.trim() !== "";
		}
		if (step === 2) {
			return formData.date !== "" && formData.location.trim() !== "";
		}
		if (step === 3) {
			const priceValid = isFree ? true : Number(formData.price) > 0;
			return priceValid && Number(formData.capacity) > 0;
		}
		return false;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({ ...prev, [name]: type === "number" ? parseFloat(value) || 0 : value }));
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		addEvent(formData);
		navigate("/dashboard");
		toast.success("Successfully created the event!");
	};

	return (
		<div className="container py-4 px-0 mx-auto">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					{/* Progress Header */}
					<div className="text-center mb-5">
						<h2 className="fw-bold display-5">
							Create New <span className="text-primary text-gradient">Event</span>
						</h2>
						<p className="text-muted">Fill in the details to launch your experience.</p>

						<div className="d-flex justify-content-between mt-4 position-relative px-5">
							{[1, 2, 3].map((s) => (
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
									style={{ width: `${(step - 1) * 50}%` }}
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
						<form onSubmit={handleSubmit}>
							<AnimatePresence>
								{/* Step 1: Basic Info */}
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

								{/* Step 2: Logistics */}
								<motion.div
									key="step2"
									className={step != 2 ? "d-none" : ""}
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

								{/* Step 3: Ticketing & Pricing */}
								<motion.div
									key="step3"
									className={step != 3 ? "d-none" : ""}
									initial={{ x: 20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -20, opacity: 0 }}
								>
									<h4 className="fw-bold mb-4">Step 3: Ticketing & Squad Pay</h4>

									<div className="mb-4">
										<label className="form-label fw-semibold d-block">Is this a free event?</label>
										<div className="btn-group w-100 shadow-sm" role="group">
											<input
												type="radio"
												className="btn-check"
												name="free"
												id="free"
												checked={isFree}
												onChange={() => setIsFree(true)}
											/>
											<label className="btn btn-outline-primary py-2 fw-bold" htmlFor="free">
												Free Event
											</label>

											<input
												type="radio"
												className="btn-check"
												name="free"
												id="paid"
												checked={!isFree}
												onChange={() => setIsFree(false)}
											/>
											<label className="btn btn-outline-primary py-2 fw-bold" htmlFor="paid">
												Paid Event
											</label>
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
													<label className="form-label fw-semibold" htmlFor="price">
														Ticket Price (INR)
													</label>
													<div className="input-group">
														<span className="input-group-text border-end-0">₹</span>
														<input
															type="number"
															id="price"
															name="price"
															value={formData.price}
															onChange={handleChange}
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
												type="number"
												name="capacity"
												value={formData.capacity}
												onChange={handleChange}
												className="form-control form-control-lg rounded-3 shadow-sm"
												placeholder="e.g. 500"
											/>
										</div>
									</div>

									<div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 mb-4">
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												id="squadPay"
												defaultChecked
											/>
											<label className="form-check-label fw-bold" htmlFor="squadPay">
												Enable Squad Booking & Split Pay{" "}
												<span className="badge bg-primary ms-2">USP</span>
											</label>
											<p className="small text-muted mb-0">
												Allow friends to split bills automatically.
											</p>
										</div>
									</div>

									{/* Limit Counter Box */}
									<div className="d-none p-3 border border-warning border-opacity-25 bg-warning bg-opacity-10 rounded-4 d-flex align-items-center justify-content-between">
										<div>
											<span className="fw-bold text-dark">Organizer Plan</span>
											<p className="small text-muted mb-0">
												You have used 3 out of 5 free slots.
											</p>
										</div>
										<span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
											3 / 5 Used
										</span>
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
								{step < 3 ? (
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
										disabled={!isStepValid()}
									>
										Publish Event
									</motion.button>
								)}
							</div>
						</form>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default EventCreationForm;
