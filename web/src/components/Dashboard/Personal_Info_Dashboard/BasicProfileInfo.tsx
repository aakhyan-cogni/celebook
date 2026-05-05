import React, { useEffect, useReducer } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/useAuthStore";
import { AVATARS } from "../../../config/constants";

interface OrganizationalInfoProps {
	registerSave: (callback: () => void) => void;
}

const BasicProfileInfo: React.FC<OrganizationalInfoProps> = ({ registerSave }) => {
	const [isUpdated, setUpdate] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const user = useAuthStore((s) => s.user)!;
	const syncUser = useAuthStore((s) => s.syncUser);
	if (!user) return null;
	const profileImg = `http://localhost:5000/uploads/avatars/${user.avatar}`;

	const images = AVATARS.reduce(
		(acc, curr) => {
			acc[curr] = `http://localhost:5000/uploads/avatars/${curr}`;
			return acc;
		},
		{} as Record<string, string>,
	);

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
			const [fname, _] = state.name.split(" ");
			if (fname.length === 0) {
				return alert("First Name cannot be empty....");
			}
			if (state.email.length === 0) {
				return alert("Email cannot be empty...");
			}
			if (!isUpdated) return;
			syncUser({
				name: state.name,
				email: state.email,
				phoneNumber: state.phoneNumber,
				dob: state.dob,
				gender: state.gender,
			});
			setUpdate(false);
		});
	}, [state]);

	function handleProfilePicChange(e: React.MouseEvent<HTMLImageElement>) {
		e.preventDefault();
		const newAvatar = e.currentTarget.id;
		syncUser({ avatar: newAvatar });
		toast.success(`Avatar updated successfully.`);
		setShowModal(false);
		return;
	}

	const ModalComponent = () => {
		return (
			<div
				className="modal show d-block p-4"
				tabIndex={-1}
				style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", zIndex: 1050 }}
			>
				<div className="modal-dialog modal-dialog-centered modal-lg">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="modal-content border-0 bg-body text-body rounded-4 overflow-hidden shadow-lg"
					>
						<div className="modal-header">
							<h5 className="modal-title">Select your avatar</h5>
							<button
								type="button"
								className="btn-close"
								onClick={() => setShowModal(false)}
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<div className="row g-4 justify-content-center">
								{Object.values(images).map((src, i) => {
									return (
										<div key={i} className="col-4 col-lg-2 text-center">
											<img
												id={Object.keys(images)[i]}
												src={src}
												onClick={handleProfilePicChange}
												className="img-fluid rounded-circle"
												style={{ aspectRatio: "1 / 1", objectFit: "cover", cursor: "pointer" }}
												alt="profile"
											/>
										</div>
									);
								})}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		);
	};

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			<AnimatePresence>{showModal && <ModalComponent />}</AnimatePresence>
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
					<h4 className={`mt-1 text-info`}>Basic Profile Info</h4>
				</div>
				<hr className={`my-2 border-info border-2 opacity-95`} />
			</div>

			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">
						<div className="col-12  d-flex flex-column align-items-center justify-content-center">
							<img src={profileImg} alt="Profile Img" className="w-25 m-3 rounded-circle" />
							<button
								onClick={(e) => {
									e.preventDefault();
									setShowModal(true);
								}}
								className={`w-50 bg-info text-dark border-none form-control rounded-2`}
							>
								Change Avatar
							</button>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">
								First Name <span className="text-danger">*</span>
							</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({
										type: "name",
										value: `${e.target.value} ${state.name.split(" ")[1].length ? state.name.split(" ")[1] : ""}`,
									});
								}}
								value={state.name.split(" ")[0]}
								type="text"
								className="form-control"
								placeholder="First Name"
							/>
						</div>

						{/* Last Name */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Last Name</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "name", value: state.name.split(" ")[0] + " " + e.target.value });
								}}
								value={state.name.split(" ")[1] || ""}
								type="text"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
							/>
						</div>

						<div className="col-12">
							<label className="form-label">Full Name</label>
							<input type="text" disabled className="form-control " value={state.name} />
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">
								Email <span className="text-danger">*</span>
							</label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "email", value: e.target.value });
								}}
								value={state.email}
								type="email"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="e.g. email@email.com"
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Phone Number</label>
							<input
								onChange={(e) => {
									if (isNaN(+e.target.value)) return;
									setUpdate(true);
									dispatch({ type: "phoneNumber", value: e.target.value });
								}}
								value={state.phoneNumber || ""}
								type="tel"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="Enter your number"
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Date of Birth </label>
							<input
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "dob", value: e.target.value });
								}}
								value={state.dob?.split("T")[0] ?? ""}
								type="date"
								className={`form-control`}
								title={!isUpdated ? "" : "Don't forget to save"}
							/>
						</div>

						<div className="col-12 col-lg-6">
							<label className="form-label">Gender</label>
							<select
								name="gender"
								className="form-control"
								onChange={(e) => {
									setUpdate(true);
									dispatch({ type: "gender", value: e.target.value });
								}}
								value={state.gender ?? ""}
							>
								<option value={undefined} hidden>
									---Select---
								</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
								<option value="Others">Others</option>
							</select>
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

export default BasicProfileInfo;

type ActionItemType = "name" | "dob" | "gender" | "email" | "phoneNumber";

interface ReducerAction {
	type: ActionItemType;
	value: unknown;
}
