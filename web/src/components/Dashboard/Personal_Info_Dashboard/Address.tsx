import React, { useEffect, useReducer, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";

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

	useEffect(() => {
		registerSave(() => {
			if (!isUpdated) return;
			syncUser({
				country: state.country,
				state: state.state,
				city: state.city,
				zipcode: state.zipcode,
			});
			setUpdate(false);
		});
	}, [state]);

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
							{/* Country */}
							<div className="col-12 col-lg-6">
								<label className="form-label">Country</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										dispatch({ type: "country", value: e.target.value });
									}}
									value={state.country || ""}
									type="text"
									className="form-control"
									placeholder="Country"
								/>
							</div>

							{/* State */}
							<div className="col-12 col-lg-6">
								<label className="form-label">State</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										dispatch({ type: "state", value: e.target.value });
									}}
									value={state.state || ""}
									type="text"
									className="form-control"
									placeholder="State"
								/>
							</div>

							<div className="col-12 col-lg-6">
								<label className="form-label">City</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										dispatch({ type: "city", value: e.target.value });
									}}
									value={state.city || ""}
									type="text"
									className="form-control"
									placeholder="City"
								/>
							</div>

							<div className="col-12 col-lg-6">
								<label className="form-label">Zipcode</label>
								<input
									onChange={(e) => {
										setUpdate(true);
										dispatch({ type: "zipcode", value: e.target.value });
									}}
									value={state.zipcode || ""}
									type="number"
									className="form-control"
									placeholder="Zipcode"
								/>
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
