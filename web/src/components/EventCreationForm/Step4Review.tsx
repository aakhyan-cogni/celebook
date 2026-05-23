// THIS FILE IS NOT USED ANYWHERE

import { motion, AnimatePresence } from "framer-motion";
import type { EventFormData } from "./constants";

interface Step4Props {
	visible: boolean;
	formData: EventFormData;
	isFreeTier: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function Step4Review({ visible, formData, isFreeTier, onChange }: Step4Props) {
	return (
		<motion.div
			key="step4"
			className={!visible ? "d-none" : ""}
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
		>
			<h4 className="fw-bold mb-4">Step 4: Visibility &amp; Team Settings</h4>
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
			<hr className="opacity-10 my-4" />
			<div className="p-4 bg-body-tertiary rounded-4 border border-primary border-opacity-10">
				<div className="form-check form-switch mb-1">
					<input
						className="form-check-input"
						type="checkbox"
						id="isTeamEvent"
						name="isTeamEvent"
						checked={formData.isTeamEvent}
						disabled={isFreeTier}
						onChange={onChange}
					/>
					<label className="form-check-label fw-bold" htmlFor="isTeamEvent">
						Team Event <span className="badge bg-primary-subtle text-primary ms-1">PRO</span>
					</label>
					<p className="small text-muted mb-0">Allow group registrations with team size limits.</p>
					{isFreeTier && (
						<div className="form-text text-warning mt-1">
							🔒 Team events require PRO.{" "}
							<a href="/pricing" className="text-warning fw-bold">
								Upgrade
							</a>
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
										type="number"
										name="minTeamSize"
										value={formData.minTeamSize}
										onChange={onChange}
										className="form-control rounded-3"
										placeholder="e.g. 2"
										min={1}
									/>
								</div>
								<div className="col-md-4">
									<label className="form-label fw-semibold small">Max Team Size</label>
									<input
										type="number"
										name="maxTeamSize"
										value={formData.maxTeamSize}
										onChange={onChange}
										className="form-control rounded-3"
										placeholder="e.g. 5"
										min={1}
									/>
								</div>
								<div className="col-md-4">
									<label className="form-label fw-semibold small">Capacity Mode</label>
									<select
										name="teamCapacityMode"
										className="form-select rounded-3"
										value={formData.teamCapacityMode}
										onChange={onChange}
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
	);
}
