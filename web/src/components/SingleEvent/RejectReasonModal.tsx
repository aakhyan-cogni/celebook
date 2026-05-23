import { useState } from "react";
import { rejectReasonSchema } from "../../lib/validation/schemas";
import { useFormErrors } from "../../lib/validation/useFormErrors";
import FieldError from "../../lib/validation/FieldError";

interface RejectReasonModalProps {
	value: string;
	adminActing: boolean;
	onChange: (v: string) => void;
	onClose: () => void;
	onConfirm: () => void;
}

export default function RejectReasonModal({
	value,
	adminActing,
	onChange,
	onClose,
	onConfirm,
}: RejectReasonModalProps) {
	const { errors, validate, clear } = useFormErrors(rejectReasonSchema);
	const [touched, setTouched] = useState(false);

	const handleConfirm = () => {
		setTouched(true);
		const result = validate({ reason: value });
		if (!result.ok) return;
		onConfirm();
	};

	return (
		<div
			className="modal d-block"
			style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0, zIndex: 50 }}
			onClick={onClose}
		>
			<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content rounded-4 border-0 shadow-lg">
					<div className="modal-header border-0 pb-0">
						<h5 className="modal-title fw-bold">Reject Event</h5>
						<button className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<p className="text-body-secondary small mb-3">
							Provide a reason so the organiser knows what to fix before resubmitting.
						</p>
						<textarea
							className={`form-control rounded-3${touched && errors.reason ? " is-invalid" : ""}`}
							rows={3}
							placeholder="e.g. Missing venue details, inappropriate content..."
							value={value}
							onChange={(e) => {
								onChange(e.target.value);
								if (touched) clear("reason");
							}}
							autoFocus
							maxLength={500}
							aria-invalid={touched && !!errors.reason}
						/>
						<FieldError message={touched ? errors.reason : undefined} />
						<div className="text-end small text-body-secondary mt-1">{value.length}/500</div>
					</div>
					<div className="modal-footer border-0 pt-0">
						<button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
							Cancel
						</button>
						<button
							className="btn btn-danger rounded-pill px-4"
							onClick={handleConfirm}
							disabled={adminActing}
						>
							{adminActing ? (
								<span className="spinner-border spinner-border-sm me-2" role="status" />
							) : null}
							Confirm Rejection
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
