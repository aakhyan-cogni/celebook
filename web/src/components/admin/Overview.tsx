import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Event, type User } from "../../store";
import { EventCard } from "../EventCard";
import { motion } from "motion/react";
import { apiFetch } from "../../lib/api";

interface OverviewProp {
	viewEventsFn: () => void;
	viewUsersFn: () => void;
}

const Overview: React.FC<OverviewProp> = ({ viewEventsFn, viewUsersFn }) => {
	const navigate = useNavigate();

	const [eventsOverview, setEvents] = useState<Event[]>([]);
	const [userOverview, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	const profileImg = `http://localhost:5000/uploads/avatars/`;

	const handleEventClick = (event: Event) => {
		navigate(`/events?q=${event.id}`);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const [eventsRes, usersRes] = await Promise.all([
					apiFetch("/admin/events", { method: "GET" }, { page: "1", limit: "5" }),
					apiFetch("/admin/users", { method: "GET" }, { page: "1", limit: "5" }),
				]);

				setEvents(eventsRes.events ?? eventsRes);
				setUsers(usersRes.users ?? usersRes);
			} catch (err) {
				console.error("Failed to fetch overview data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center p-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			{/* Event Stats */}
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">Event Stats</h3>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => viewEventsFn()}
						className="btn border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
					>
						<span>View More</span>
					</motion.button>
				</div>

				{eventsOverview.length > 0 ? (
					<div className="row g-4">
						{eventsOverview.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<EventCard event={event} onClick={handleEventClick} />
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">No events available right now.</p>
					</div>
				)}
			</section>

			<hr className="my-5 opacity-10" />

			{/* User Stats */}
			<section>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">User Stats</h3>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => viewUsersFn()}
						className="btn border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
					>
						<i className="bi bi-plus-lg"></i>
						<span>View More</span>
					</motion.button>
				</div>

				{userOverview.length > 0 ? (
					<div className="row g-4">
						{userOverview.map((user) => (
							<div key={user.id} className="col-md-6 col-lg-4">
								<div className="card shadow-sm rounded-4 p-3">
									<div className="d-flex align-items-center gap-3">
										<img
											src={profileImg + user.avatar}
											alt={user.name}
											className="rounded-circle"
											width={48}
											height={48}
											style={{ objectFit: "cover" }}
										/>
										<div>
											<p className="fw-bold mb-0">{user.name}</p>
											<p className="text-muted small mb-0">{user.email}</p>
											<span className="badge bg-secondary mt-1">{user.role}</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">No users registered till now.</p>
					</div>
				)}
			</section>
		</div>
	);
};

export default Overview;
