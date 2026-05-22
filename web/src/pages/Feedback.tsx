import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { BASE_URL } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import StarRating from "../components/StarRating";
import {
	FEEDBACK_FIELD_LABELS,
	FEEDBACK_RATING_FIELDS,
	getMyFeedback,
	submitFeedback,
} from "../api/feedback.api";
import type { FeedbackPayload, FeedbackRatingField } from "../api/feedback.api";

const initialRatings: Record<FeedbackRatingField, number> = {
	overallRating: 0,
	worthAttending: 0,
	contentRelevance: 0,
	venueQuality: 0,
	punctuality: 0,
	facilitatorBehaviour: 0,
};

export default function FeedbackPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated, accessToken } = useAuthStore();

	const [event, setEvent] = useState<any>(null);
	const [loadingEvent, setLoadingEvent] = useState(true);
	const [eventError, setEventError] = useState<string | null>(null);
	const [ratings, setRatings] = useState(initialRatings);
	const [wouldAttendAgain, setWouldAttendAgain] = useState<boolean | null>(null);
	const [areasOfImprovement, setAreasOfImprovement] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [alreadySubmitted, setAlreadySubmitted] = useState(false);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!id) return;
		if (!isAuthenticated) {
			navigate("/login", { replace: true });
			return;
		}
		if (!accessToken) return;

		const load = async () => {
			try {
				setLoadingEvent(true);
				const headers: HeadersInit = {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				};
				const res = await fetch(`${BASE_URL}/events/${id}`, {
					method: "GET",
					headers,
					credentials: "include",
				});
				if (!res.ok) {
					setEventError(res.status === 404 ? "NOT_FOUND" : "ERROR");
					return;
				}
				const data = await res.json();
				setEvent(data);

				const mine = await getMyFeedback(id).catch(() => null);
				if (mine?.data) {
					setAlreadySubmitted(true);
				}
			} catch {
				setEventError("ERROR");
			} finally {
				setLoadingEvent(false);
			}
		};

		load();
	}, [id, isAuthenticated, accessToken, navigate]);

	if (loadingEvent) {
		return (
			<div className="container py-5 text-center">
				<div
					className="spinner-border text-primary"
					role="status"
					style={{ width: "3rem", height: "3rem" }}
				/>
				<p className="mt-3 text-body-secondary">Loading feedback form...</p>
			</div>
		);
	}

	if (eventError || !event) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">We couldn't load this event</h3>
				<p className="text-body-secondary">Please try again later.</p>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(-1)}>
					Go back
				</button>
			</div>
		);
	}

	const isPastEvent = new Date(event.date).getTime() < Date.now();
	const isRegistered = !!event.userRegistration;
	const didAttend = event.userRegistration?.attendanceStatus === "PRESENT";
	const feedbackOpen = !!event.hostFeedbackSentAt;

	if (!isPastEvent) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">Feedback isn't open yet</h3>
				<p className="text-body-secondary">
					You can leave feedback once the event has finished.
				</p>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/events/${id}`)}>
					Back to event
				</button>
			</div>
		);
	}

	if (!isRegistered) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">Only attendees can leave feedback</h3>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/events/${id}`)}>
					Back to event
				</button>
			</div>
		);
	}

	if (!didAttend) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">Only attendees who were checked in can leave feedback</h3>
				<p className="text-body-secondary">
					Our records show you didn't attend this event, so feedback isn't available.
				</p>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/events/${id}`)}>
					Back to event
				</button>
			</div>
		);
	}

	if (!feedbackOpen) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">Feedback hasn't been requested yet</h3>
				<p className="text-body-secondary">
					The host hasn't opened feedback for this event yet. Please check back later.
				</p>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/events/${id}`)}>
					Back to event
				</button>
			</div>
		);
	}

	if (alreadySubmitted) {
		return (
			<div className="container py-5 text-center">
				<h3 className="fw-bold mb-2">You've already submitted feedback</h3>
				<p className="text-body-secondary">Thanks for sharing your thoughts!</p>
				<button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/events/${id}`)}>
					Back to event
				</button>
			</div>
		);
	}

	const userRatedFields = FEEDBACK_RATING_FIELDS.filter((f) => f !== "overallRating");

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;

		const nextErrors: Record<string, string> = {};
		for (const f of userRatedFields) {
			if (!(ratings[f] >= 0.5)) nextErrors[f] = "Please rate this category";
		}
		if (wouldAttendAgain === null) nextErrors.wouldAttendAgain = "Please choose Yes or No";
		if (areasOfImprovement.length > 1000) nextErrors.areasOfImprovement = "Must be 1000 characters or less";

		if (Object.keys(nextErrors).length > 0) {
			setFormErrors(nextErrors);
			toast.error("Please complete all required fields");
			return;
		}
		setFormErrors({});

		setSubmitting(true);
		try {
			// overallRating is the mean of the other five ratings, rounded to the nearest 0.5
			// so it satisfies the backend's 0.5-step validator.
			const avg =
				userRatedFields.reduce((sum, f) => sum + ratings[f], 0) / userRatedFields.length;
			const overallRating = Math.max(0.5, Math.round(avg * 2) / 2);

			const payload: FeedbackPayload = {
				overallRating,
				worthAttending: ratings.worthAttending,
				contentRelevance: ratings.contentRelevance,
				venueQuality: ratings.venueQuality,
				punctuality: ratings.punctuality,
				facilitatorBehaviour: ratings.facilitatorBehaviour,
				wouldAttendAgain: wouldAttendAgain!,
				areasOfImprovement: areasOfImprovement.trim(),
			};
			await submitFeedback(id, payload);
			toast.success("Feedback submitted. Thanks!");
			navigate(`/events/${id}`);
		} catch (err: any) {
			toast.error(err?.message || "Failed to submit feedback");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
			className="container py-4"
		>
			<div className="py-2">
				<button
					onClick={() => navigate(`/events/${id}`)}
					className="btn btn-link text-decoration-none text-primary fw-bold p-0 d-flex align-items-center"
					style={{ fontSize: "0.85rem" }}
				>
					<span className="me-2" style={{ fontSize: "1.5rem" }}>←</span>
					Back to event
				</button>
			</div>

			<div className="row justify-content-center">
				<div className="col-lg-8">
					<div className="card border-0 shadow-sm rounded-4 p-4 bg-body-tertiary">
						<div className="mb-4">
							<span className="badge bg-primary-subtle text-primary rounded-pill px-3 mb-2">
								Feedback
							</span>
							<h2 className="fw-bold mb-1">{event.title}</h2>
							<p className="text-body-secondary small mb-0">
								Share your honest thoughts — your responses help us improve future events.
							</p>
						</div>

						<form onSubmit={onSubmit}>
							{userRatedFields.map((field) => (
								<div
									key={field}
									className="py-3 border-bottom"
								>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<div className="fw-semibold text-body">{FEEDBACK_FIELD_LABELS[field]}</div>
											<div className="text-body-secondary small">
												{ratings[field] > 0 ? `${ratings[field]} / 5` : "Tap a star to rate"}
											</div>
										</div>
										<StarRating
											value={ratings[field]}
											onChange={(v) => {
												setRatings((prev) => ({ ...prev, [field]: v }));
												if (formErrors[field]) setFormErrors((p) => { const { [field]: _, ...rest } = p; return rest; });
											}}
											size={28}
										/>
									</div>
									{formErrors[field] && (
										<div className="text-danger small mt-1" role="alert">{formErrors[field]}</div>
									)}
								</div>
							))}

							<div className="py-3 border-bottom">
								<div className="fw-semibold text-body mb-2">Would you attend again?</div>
								<div className="d-flex gap-2">
									<button
										type="button"
										className={`btn rounded-pill px-4 fw-bold ${wouldAttendAgain === true ? "btn-success" : "btn-outline-success"}`}
										onClick={() => { setWouldAttendAgain(true); setFormErrors((p) => { const { wouldAttendAgain: _, ...rest } = p; return rest; }); }}
									>
										Yes
									</button>
									<button
										type="button"
										className={`btn rounded-pill px-4 fw-bold ${wouldAttendAgain === false ? "btn-danger" : "btn-outline-danger"}`}
										onClick={() => { setWouldAttendAgain(false); setFormErrors((p) => { const { wouldAttendAgain: _, ...rest } = p; return rest; }); }}
									>
										No
									</button>
								</div>
								{formErrors.wouldAttendAgain && (
									<div className="text-danger small mt-2" role="alert">{formErrors.wouldAttendAgain}</div>
								)}
							</div>

							<div className="py-3">
								<label htmlFor="areasOfImprovement" className="fw-semibold text-body mb-2 d-block">
									Areas of Improvement <span className="text-body-secondary fw-normal small">(optional)</span>
								</label>
								<textarea
									id="areasOfImprovement"
									className={`form-control rounded-3${formErrors.areasOfImprovement ? " is-invalid" : ""}`}
									rows={4}
									maxLength={1000}
									placeholder="What could have been better?"
									value={areasOfImprovement}
									onChange={(e) => { setAreasOfImprovement(e.target.value); if (formErrors.areasOfImprovement) setFormErrors((p) => { const { areasOfImprovement: _, ...rest } = p; return rest; }); }}
								/>
								{formErrors.areasOfImprovement && (
									<div className="invalid-feedback d-block">{formErrors.areasOfImprovement}</div>
								)}
								<div className="text-end small text-body-secondary mt-1">
									{areasOfImprovement.length} / 1000
								</div>
							</div>

							<div className="d-flex justify-content-end pt-2">
								<button
									type="submit"
									className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
									disabled={submitting}
								>
									{submitting ? (
										<>
											<span className="spinner-border spinner-border-sm me-2" role="status" />
											Submitting...
										</>
									) : (
										"Submit Feedback"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
