import React, { useEffect, useReducer, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";

interface OrganizationalInfoProps {
	registerSave: (callback: () => void) => void;
}

const OrganizationalInfo: React.FC<OrganizationalInfoProps> = ({ registerSave }) => {
	const [isUpdated, setUpdate] = useState(false);
	const user = useAuthStore((s) => s.user);
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
		// Updating cached function
		registerSave(() => {
			if (!isUpdated) return;
			syncUser({
				orgName: state.orgName,
				designation: state.designation,
				companyWebsite: state.companyWebsite,
				bio: state.bio,
			});
			setUpdate(false);
		});
	}, [state]);

	return (
		<div className="container-fluid h-auto d-flex flex-column personal-wrapper">
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
					<h4 className={`mt-1 text-info`}>Organizational Info</h4>
				</div>
				<hr className={`my-2 border-info border-2 opacity-95`} />
			</div>
			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">
						<div className="col-12 col-lg-6">
							<label className="form-label">Organization Name</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "orgName", value: e.target.value });
								}}
								value={state.orgName || ""}
								type="text"
								className="form-control"
								placeholder="Organization name"
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Role / designation</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "designation", value: e.target.value });
								}}
								value={state.designation || ""}
								type="text"
								className="form-control"
								placeholder="Role"
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Company Website</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "companyWebsite", value: e.target.value });
								}}
								value={state.companyWebsite || ""}
								type="url"
								className="form-control"
								placeholder="Company website"
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Bio / description</label>
							<textarea
								rows={3}
								// onKeyUp={() => setUpdate(true)}
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "bio", value: e.target.value });
								}}
								value={state.bio || ""}
								className="form-control"
								placeholder="Bio"
							/>
						</div>
					</div>
				</form>
			</div>
			<div hidden={!isUpdated} className="col-6 alert alert-warning" role="alert">
				⚠️ Don't forget to save
			</div>
		</div>
	);
};

export default OrganizationalInfo;

type ActionItemType = "bio" | "designation" | "orgName" | "companyWebsite";

interface ReducerAction {
	type: ActionItemType;
	value: unknown;
}
