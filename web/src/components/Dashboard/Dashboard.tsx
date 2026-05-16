import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EventCard } from "../EventCard";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import { apiFetch } from "../../lib/api";

interface DashboardProps {
	viewEventsFn: () => void;
	viewBookingsFn: () => void;
}

const OVERVIEW_LIMIT = 5;

export default function Dashboard({ viewEventsFn, viewBookingsFn }: DashboardProps) {
	const navigate        = useNavigate();
	const accessToken     = useAuthStore((s) => s.accessToken);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const [myEvents,   setMyEvents]   = useState<any[]>([]);
	const [myBookings, setMyBookings] = useState<any[]>([]);
	const [loading,    setLoading]    = useState(true);

	useEffect(() => {
		// Wait for hydration: on page refresh accessToken is briefly null while
		// /auth/refresh runs. Firing apiFetch before then sends "Bearer null".
		if (isAuthenticated && !accessToken) {
			setLoading(true);
			return;
		}
		if (!accessToken) return;

		let cancelled = false;
		const load = async () => {
			setLoading(true);
			try {
				const [eventsRes, bookingsRes] = await Promise.all([
					apiFetch("/events/mine", { method: "GET" }),
					apiFetch("/registrations/my-registrations", { method: "GET" }),
				]);
				if (cancelled) return;
				const events = Array.isArray(eventsRes) ? eventsRes : (eventsRes.events ?? []);
				const bookings = bookingsRes?.data ?? bookingsRes ?? [];
				setMyEvents(events.slice(0, OVERVIEW_LIMIT));
				setMyBookings(bookings.slice(0, OVERVIEW_LIMIT));
			} catch (err) {
				console.error("Failed to load dashboard overview:", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => { cancelled = true; };
	}, [accessToken, isAuthenticated]);

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
			{/* Events you're organizing */}
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
					<h3 className="fw-bold mb-0">Your Events</h3>
					<div className="d-flex align-items-center gap-2">
						<motion.button
							whileTap={{ scale: 0.95 }}
							className="btn btn-primary rounded-pill px-4 fw-bold"
							onClick={() => navigate("/create")}
						>
							+ Create event
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={viewEventsFn}
							className="btn border px-3 py-1 rounded-3 shadow-sm fw-bold"
						>
							View More
						</motion.button>
					</div>
				</div>

				{myEvents.length > 0 ? (
					<div className="row g-4">
						{myEvents.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<EventCard
									event={event}
									eventStatus
									onClick={() => navigate(`/events/${event.id}`, { state: { eventData: event } })}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-2">You haven't created any events yet.</p>
						<motion.button
							whileTap={{ scale: 0.95 }}
							className="btn btn-primary rounded-pill px-4 my-2"
							onClick={() => navigate("/create")}
						>
							Create your first event
						</motion.button>
					</div>
				)}
			</section>

			<hr className="my-5 opacity-10" />

			{/* Your bookings */}
			<section>
				<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
					<h3 className="fw-bold mb-0">Your Bookings</h3>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={viewBookingsFn}
						className="btn border px-3 py-1 rounded-3 shadow-sm fw-bold"
					>
						View More
					</motion.button>
				</div>

				{myBookings.length > 0 ? (
					<div className="row g-4">
						{myBookings.map((booking) => {
							const ev = booking.eventId;
							if (!ev) return null;
							const evId = ev.id ?? ev._id;
							return (
								<div key={booking._id ?? booking.id ?? evId} className="col-md-6 col-lg-4">
									<EventCard
										event={{ ...ev, id: evId }}
										onClick={() => navigate(`/events/${evId}`, { state: { eventData: ev } })}
									/>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-2">You haven't booked any events yet.</p>
						<motion.button
							whileTap={{ scale: 0.95 }}
							className="btn btn-primary rounded-pill px-4 my-2"
							onClick={() => navigate("/events")}
						>
							Discover events
						</motion.button>
					</div>
				)}
			</section>
		</div>
	);
}
