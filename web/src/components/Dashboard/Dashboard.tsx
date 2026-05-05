import { useNavigate } from "react-router";
import { useLocalDB, type Event } from "../../store";
import { EventCard } from "../EventCard";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Dashboard() {
	const user = useAuthStore((s) => s.user)!;
	const events = useLocalDB((s) => s.events);
	const navigate = useNavigate();

	const myEvents = events.filter((e) => e.organizerEmail === user.email);
	const otherEvents = events.filter((e) => e.organizerEmail !== user.email);

	const handleEventClick = (event: Event) => {
		navigate(`/events?q=${event.id}`);
	};

	return (
		<div className="container">
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">Events You're Organizing</h3>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => navigate("/create")}
						className="btn btn-primary px-3 py-1 rounded-pill shadow-sm fw-bold d-flex align-items-center"
					>
						<i className="bi bi-plus-lg"></i> {/* Assuming Bootstrap Icons */}
						<span>Create New Event</span>
					</motion.button>
				</div>

				{myEvents.length > 0 ? (
					<div className="row g-4">
						{myEvents.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<EventCard event={event} onClick={handleEventClick} />
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">You haven't created any events yet.</p>
					</div>
				)}
			</section>

			<hr className="my-5 opacity-10" />

			<section>
				<h3 className="fw-bold mb-4">Explore Events</h3>
				<div className="row g-4">
					{otherEvents.length > 0 ? (
						otherEvents.map((event) => (
							<div key={event.id} className="col-md-6 col-lg-4">
								<EventCard event={event} onClick={handleEventClick} />
							</div>
						))
					) : (
						<p className="text-muted">No other events available right now.</p>
					)}
				</div>
			</section>
		</div>
	);
}
