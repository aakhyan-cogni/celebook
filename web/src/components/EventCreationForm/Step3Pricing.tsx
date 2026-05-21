import { motion, AnimatePresence } from "framer-motion";
import type { EventFormData } from "./constants";

interface Step3Props {
	visible: boolean;
	formData: EventFormData;
	isFree: boolean;
	setIsFree: (v: boolean) => void;
	setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function Step3Pricing({
	visible,
	formData,
	isFree,
	setIsFree,
	setFormData,
	onChange,
}: Step3Props) {
	return (
		<motion.div
			key="step3"
			className={!visible ? "d-none" : ""}
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
		>
			<h4 className="fw-bold mb-4">Step 3: Ticketing, Visibility &amp; Team Settings</h4>

			{/* ── Ticketing ── */}
			<div className="mb-4">
				<label className="form-label fw-semibold d-block">Is this a free event?</label>
				<div className="btn-group w-100 shadow-sm" role="group">
					<input
						type="radio"
						className="btn-check"
						name="free"
						id="free"
						checked={isFree}
						onChange={() => { setIsFree(true); setFormData((p) => ({ ...p, price: 0 })); }}
					/>
					<label className="btn btn-outline-primary py-2 fw-bold" htmlFor="free">Free Event</label>
					<input
						type="radio"
						className="btn-check"
						name="free"
						id="paid"
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
									type="number"
									id="price"
									name="price"
									value={formData.price}
									onChange={onChange}
									min={1}
									step={1}
									onKeyDown={(e) => {
										if (e.key === "-" || e.key === "+" || e.key === "e") e.preventDefault();
									}}
									className="form-control form-control-lg rounded-end-3 border-start-0 shadow-sm"
									placeholder="0"
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
						onChange={onChange}
						min={1}
						step={1}
						onKeyDown={(e) => {
							if (e.key === "-" || e.key === "+" || e.key === "e") e.preventDefault();
						}}
						className="form-control form-control-lg rounded-3 shadow-sm"
						placeholder="e.g. 500"
					/>
				</div>
			</div>

			<hr className="opacity-10 my-4" />

			{/* ── Visibility ── */}
			<div className="mb-4">
				<label className="form-label fw-semibold">Visibility</label>
				<select
					name="visibility"
					className="form-select form-control-lg rounded-3 shadow-sm"
					value={formData.visibility}
					onChange={onChange}
				>
					<option value="PUBLIC">🌍 Public — Listed in search results</option>
					<option value="UNLISTED">🔗 Unlisted — Only accessible via direct link</option>
				</select>
			</div>
		</motion.div>
	);
}