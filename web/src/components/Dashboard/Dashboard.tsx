import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Booking, type Event, type User } from "../../store";
import { EventCard } from "../EventCard";
import { motion } from "motion/react";
import { apiFetch } from "../../lib/api";
import { h1 } from "motion/react-client";

interface DashboardProp {
	viewEventsFn: () => void;
	viewBookingsFn: () => void;
}

const Dashboard: React.FC<DashboardProp> = ({ viewEventsFn, viewBookingsFn }) => {
	const navigate = useNavigate();

	const [eventsDashboard, setEvents] = useState<Event[]>([]);
	const [BookingDashboard, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);

	const profileImg = `http://localhost:5000/uploads/avatars/`;

	const handleEventClick = (event: Event) => {
		navigate(`/events?q=${event.id}`);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const [eventsRes, BookingsRes] = await Promise.all([
					apiFetch("/events/mine", { method: "GET" }, { page: "1", limit: "5" }),
					apiFetch("/registrations/my-registrations", { method: "GET" }, { page: "1", limit: "5" }),
				]);

				setEvents(eventsRes.events ?? eventsRes);
				setBookings(BookingsRes.data || []);
			} catch (err) {
				console.error("Failed to fetch Dashboard data:", err);
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
			{/* My Events */}
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">My Events</h3>
					<div className="d-flex justify-content-around align-items-center mb-4 gap-2">
						<motion.button whileTap={{ scale: 0.95 }} className="btn btn-primary rounded-pill px-4" onClick={() => navigate("/create")}>
							Create event
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => viewEventsFn()}
							className="btn border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
						>
							<span>View More</span>
						</motion.button>
					</div>
				</div>

				{eventsDashboard.length > 0 ? (
					<div className="row g-4">
						{eventsDashboard.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<EventCard event={event} onClick={handleEventClick} 
								eventStatus={true}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">No events available right now.</p>
						<motion.button whileTap={{ scale: 0.95 }} className="btn btn-primary rounded-pill px-4 my-2" onClick={() => navigate("/create")}>
							Create your first event
						</motion.button>
					</div>
				)}
			</section>

			<hr className="my-5 opacity-10" />

			{/* Booking Stats */}
			<section>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">Booking Stats</h3>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => viewBookingsFn()}
						className="btn border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
					>
						<i className="bi bi-plus-lg"></i>
						<span>View More</span>
					</motion.button>
				</div>

				{BookingDashboard.length > 0 ? (
					<div className="row g-4">
						{BookingDashboard.map((booking) => (
						<div key={booking.eventId.id} className="col-md-6 col-lg-4">
							
							<EventCard
							event={booking.eventId}
							onClick={handleEventClick}
							/>
							
						</div>
						))}
					</div>
					) : (

					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">No Bookings till now.</p>
						<motion.button whileTap={{ scale: 0.95 }} className="btn btn-primary rounded-pill px-4 my-2" onClick={() => navigate("/events")}>
							Book your first event
						</motion.button>
					</div>
				)}
			</section>
		</div>
	);
};

export default Dashboard;
