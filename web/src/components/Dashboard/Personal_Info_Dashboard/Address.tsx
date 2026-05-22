import React, { useEffect, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/useAuthStore";
import { addressSchema } from "../../../lib/validation/schemas";
import { useFormErrors } from "../../../lib/validation/useFormErrors";
import FieldError from "../../../lib/validation/FieldError";

interface OrganizationalInfoProps {
	registerSave: (callback: () => void) => void;
}

const Address: React.FC<OrganizationalInfoProps> = ({ registerSave }) => {
	const [isUpdated, setUpdate] = useState(false);
	const user = useAuthStore((s) => s.user)!;
	const syncUser = useAuthStore((s) => s.syncUser);
	if (!user) return null;

	const reducer = (state: typeof user, action: ReducerAction): typeof user => {
		return {
			...state,
			[action.type]: String(action.value),
		};
	};

	const [state, dispatch] = useReducer(reducer, user);
	const { errors, validate, clear } = useFormErrors(addressSchema);

	useEffect(() => {
		registerSave(() => {
			if (!isUpdated) return;
			const payload = {
				country: state.country ?? "",
				state: state.state ?? "",
				city: state.city ?? "",
				zipcode: state.zipcode ?? "",
			};
			const result = validate(payload);
			if (!result.ok) {
				toast.error("Please fix the highlighted address fields");
				return;
			}
			syncUser(payload);
			setUpdate(false);
		});
	}, [state, isUpdated, validate, syncUser, registerSave]);

	return (
		<div>
			<div className="container-fluid h-auto d-flex flex-column personal-wrapper">
				<div className="flex-shrink-0">
					<div className="d-flex align-items-center w-100 overflow-hidden">
						<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
						<h4 className={`mt-1 text-info`}>Address Info</h4>
					</div>
					<hr className={`my-2 border-info border-2 opacity-95`} />
				</div>

				<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
					<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
						<div className="row g-3">
							<div className="col-12 col-lg-6">
								<label className="form-label">Country</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										clear("country");
										dispatch({ type: "country", value: e.target.value });
									}}
									value={state.country || ""}
									type="text"
									className={`form-control${errors.country ? " is-invalid" : ""}`}
									placeholder="Country"
									aria-invalid={!!errors.country}
								/>
								<FieldError message={errors.country} />
							</div>

							<div className="col-12 col-lg-6">
								<label className="form-label">State</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										clear("state");
										dispatch({ type: "state", value: e.target.value });
									}}
									value={state.state || ""}
									type="text"
									className={`form-control${errors.state ? " is-invalid" : ""}`}
									placeholder="State"
									aria-invalid={!!errors.state}
								/>
								<FieldError message={errors.state} />
							</div>

							<div className="col-12 col-lg-6">
								<label className="form-label">City</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										clear("city");
										dispatch({ type: "city", value: e.target.value });
									}}
									value={state.city || ""}
									type="text"
									className={`form-control${errors.city ? " is-invalid" : ""}`}
									placeholder="City"
									aria-invalid={!!errors.city}
								/>
								<FieldError message={errors.city} />
							</div>

							<div className="col-12 col-lg-6">
								<label className="form-label">Zipcode</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										clear("zipcode");
										dispatch({ type: "zipcode", value: e.target.value });
									}}
									value={state.zipcode || ""}
									type="text"
									inputMode="text"
									className={`form-control${errors.zipcode ? " is-invalid" : ""}`}
									placeholder="Zipcode"
									aria-invalid={!!errors.zipcode}
								/>
								<FieldError message={errors.zipcode} />
							</div>

							<div className="col-12">
								<label className="form-label">Address</label>
								<textarea
									rows={3}
									value={[state.city, state.state, state.country, state.zipcode]
										.filter(Boolean)
										.join(", ")}
									className="form-control"
									disabled
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
			<div hidden={!isUpdated} className="col-6 alert alert-warning" role="alert">
				⚠️ Don't forget to save
			</div>
		</div>
	);
};

export default Address;

type ActionItemType = "country" | "state" | "zipcode" | "city";

interface ReducerAction {
	type: ActionItemType;
	value: unknown;
}
