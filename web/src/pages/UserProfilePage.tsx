import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
// import { type User } from "../store.js";

const UserProfilePage = () => {
	const { id } = useParams<{ id: string }>();

	const [userProfile, setUserProfile] = useState<any>(); // Replace 'any' with 'User'
	const [loading, setLoading] = useState(true);

	const getProfileURL = (avatar: string) => `http://localhost:5000/uploads/avatars/${avatar}`;

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const res = await fetch(`http://localhost:5000/api/user/profile/${id}`);
				const user = await res.json();
				setUserProfile(user);
			} catch (error) {
				console.error("Failed to fetch user profile", error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center vh-100 bg-body-tertiary">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	const firstName = userProfile?.name?.split(" ")[0] || "";
	const lastName = userProfile?.name?.split(" ").slice(1).join(" ") || "";

	const joinDate = (dateString:string) => {
		if (!dateString) return "Recently";

		console.log(dateString)
		const joinedDate = new Date(dateString);
		const today = new Date();

		const yearsDiff = today.getFullYear() - joinedDate.getFullYear();
		const monthsDiff = today.getMonth() - joinedDate.getMonth();
		const totalMonths = yearsDiff * 12 + monthsDiff;

		if (totalMonths >= 12) {
			const years = Math.floor(totalMonths / 12);
			return `${years} year${years > 1 ? "s" : ""} ago`;
		}

		if (totalMonths > 0) {
			return `${totalMonths} month${totalMonths > 1 ? "s" : ""} ago`;
		}

		return "Recently";
	};


	return (
		/* bg-body-tertiary acts as a subtle background in both light and dark modes */
		<div className="container-fluid  bg-body-tertiary py-5">
			<div className="container">
				<div className="row g-4">
					{/* 1. Primary Identity Tile */}
					<div className="col-12 col-lg-5">
						<div className="card text-bg-info rounded-4 h-100 border-0 p-4 p-md-5 d-flex flex-column justify-content-between shadow-sm">
							<div className="">
								<img
									src={getProfileURL(userProfile?.avatar ?? "default.png")}
									alt="Profile"
									className="rounded-circle mb-4 border border-3 border-body bg-body"
									style={{ width: "120px", height: "120px", objectFit: "cover" }}
								/>
								<h3 className="fw-bolder display-6 mb-0 text-white">{firstName}</h3>
								<h3 className="fw-light text-white">{lastName}</h3>
							</div>
							<div>
								<span className="badge bg-body text-body px-3 py-2 rounded-pill fw-bold">
									{userProfile?.designation || "Member"}
								</span>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-7 d-flex flex-column justify-content-around">
						<div className="card bg-body text-body rounded-4 h-45 border-0 p-4 shadow-sm">
							<div className="text-body-secondary mb-2">📍 Location</div>
							<h3 className="fw-bold mb-0">{userProfile?.city || "Unknown City"}</h3>
							<div className="text-body-secondary fs-5">{userProfile?.country || "Earth"}</div>
						</div>

						<div className="card bg-body text-body rounded-4 h-50 border-0 p-4 shadow-sm">
							<div className="text-body-secondary mb-2">🏢 Organization</div>
							<h3 className="fw-bold mb-0">{userProfile?.orgName || "Independent"}</h3>
							<div className="text-body-secondary fs-5">{joinDate(userProfile?.createdAt)}</div>
						</div>
					</div>

					{/* 3. Location Tile */}
					<div className="col-12 col-md-8 ">
						<div className="card bg-body  text-body rounded-4 h-100 border-0 p-4 p-md-5  shadow-sm d-flex flex-column justify-content-center">
							<h6 className="text-uppercase text-body-secondary fw-bold mb-3">About</h6>
							<p className="fs-5 fw-medium lh-sm mb-0">
								{userProfile?.bio ? `"${userProfile.bio}"` : "No biography provided yet."}
							</p>
						</div>
					</div>

					{/* 5. Website/Call to Action Tile */}
					<div className="col-12 col-lg-4">
						{userProfile?.companyWebsite ? (
							/* Using a secondary background for the link card to give it distinction */
							<div className="card bg-body-secondary text-body rounded-4 h-100 border-0 shadow-sm d-flex flex-column">
								<div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
									<h4 className="fw-bold mb-1">Visit Website</h4>
									<span className="text-body-secondary small text-break mb-3">
										{userProfile.companyWebsite}
									</span>
									<Link
										to={userProfile.companyWebsite}
										target="_blank"
										className="btn btn-primary rounded-pill px-4 fw-bold mt-auto"
									>
										Open Link
									</Link>
								</div>
							</div>
						) : (
							<div className="card bg-body-secondary rounded-4 h-100 border-0 p-4 shadow-sm d-flex flex-column justify-content-center align-items-center text-center">
								<div className="text-body-secondary mb-2">Website</div>
								<h5 className="text-body-tertiary mb-0">No link available</h5>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfilePage;
