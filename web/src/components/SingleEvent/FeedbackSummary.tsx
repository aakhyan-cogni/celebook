import { useEffect, useState } from "react";
import {
	FEEDBACK_FIELD_LABELS,
	FEEDBACK_RATING_FIELDS,
	getFeedbackSummary,
} from "../../api/feedback.api";
import type { FeedbackSummary as FeedbackSummaryData } from "../../api/feedback.api";

interface FeedbackSummaryProps {
	eventId: string;
	refreshKey?: number;
}

export default function FeedbackSummary({ eventId, refreshKey = 0 }: FeedbackSummaryProps) {
	const [summary, setSummary] = useState<FeedbackSummaryData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getFeedbackSummary(eventId)
			.then((res) => setSummary(res.data))
			.catch(() => setSummary(null))
			.finally(() => setLoading(false));
	}, [eventId, refreshKey]);

	if (loading) {
		return (
			<div className="card border-0 bg-body-tertiary rounded-4 p-4 mt-4 text-center">
				<div className="spinner-border text-primary mx-auto" role="status" />
			</div>
		);
	}

	if (!summary) return null;
	if (!summary.hostFeedbackSentAt && summary.averages.feedbackCount === 0) return null;

	const count = summary.averages.feedbackCount;
	const otherFields = FEEDBACK_RATING_FIELDS.filter((f) => f !== "overallRating");
	const overallAvg =
		count > 0
			? otherFields.reduce((sum, f) => sum + summary.averages[f], 0) / otherFields.length
			: 0;

	const renderBar = (label: string, value: number, highlight = false) => {
		const widthPct = Math.max(0, Math.min(100, (value / 5) * 100));
		return (
			<div className={`mb-2 ${highlight ? "p-2 rounded-3 bg-body" : ""}`}>
				<div className="d-flex justify-content-between small">
					<span className={highlight ? "fw-bold" : ""}>{label}</span>
					<span className="fw-semibold">{value.toFixed(2)} / 5</span>
				</div>
				<div className="progress" style={{ height: highlight ? 12 : 8 }}>
					<div
						className={`progress-bar ${highlight ? "bg-warning" : "bg-primary"}`}
						style={{ width: `${widthPct}%` }}
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="card border-0 bg-body-tertiary rounded-4 p-4 mt-4">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h6 className="fw-bold mb-0">Attendee Feedback</h6>
				<span className="small text-body-secondary">
					{count} response{count === 1 ? "" : "s"}
				</span>
			</div>

			{count === 0 ? (
				<p className="text-body-secondary small mb-0">
					Feedback has been opened. Attendee ratings will appear here.
				</p>
			) : (
				<>
					{renderBar("Overall Rating", overallAvg, true)}

					<hr className="my-3 opacity-25" />

					{otherFields.map((field) =>
						<div key={field}>
							{renderBar(FEEDBACK_FIELD_LABELS[field], summary.averages[field])}
						</div>,
					)}

					{summary.comments.length > 0 && (
						<div className="mt-4">
							<h6 className="fw-bold mb-2">Areas of Improvement</h6>
							<table className="table table-sm mb-0">
								<thead>
									<tr>
										<th style={{ width: "30%" }}>Date</th>
										<th>Comment</th>
									</tr>
								</thead>
								<tbody>
									{summary.comments.map((c) => (
										<tr key={c.id}>
											<td className="small text-body-secondary">
												{new Date(c.createdAt).toLocaleDateString()}
											</td>
											<td className="small">{c.text}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
		</div>
	);
}
