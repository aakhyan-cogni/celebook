import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Event } from "../../store";
import { EventCard } from "../EventCard";
import { motion } from "motion/react";
import { apiFetch } from "../../lib/api";

const Events = () => {
	const navigate = useNavigate();

	const [eventsOverview, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [eventStatus, setEventStatus] = useState("ALL");
	let eventsRes = null;
	const [search, setSearch] = useState("");

	const handleEventClick = (event: Event) => {
		navigate(`/events?q=${event.id}`);
	};

	useEffect(() => {
		const fetchData = async () => {
			console.log(page);

			try {
				setLoading(true);

				if (eventStatus === "ALL")
					eventsRes = await apiFetch(
						"/admin/events",
						{ method: "GET" },
						{ page: page.toString(), limit: "20" },
					);
				else
					eventsRes = await apiFetch(
						"/admin/events",
						{ method: "GET" },
						{ page: page.toString(), limit: "20", status: eventStatus },
					);
				setEvents(eventsRes.events ?? eventsRes);

				if (eventsRes.events.length <= 0) {
					setPage((prev) => prev - 1);
				}
			} catch (err) {
				console.error("Failed to fetch overview data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [page, eventStatus]);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center p-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (page <= 0) setPage(1);

	const displayEvents =
		search === ""
			? eventsOverview
			: eventsOverview.filter((event) => {
					return (
						event.category.toString() +
						event.description.toString() +
						event.location.toString() +
						event.price.toString() +
						event.title.toString() +
						event.organizerEmail.toString()
					)
						.toLowerCase()
						.includes(search.toLowerCase());
				});

	return (
		<div className="container">
			{/* Event Stats */}
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">Event Stats</h3>

					<div className="d-flex justify-content-around gap-3 align-items-center mb-4">
						<input
							className="form-control w-auto"
							type="search"
							placeholder="Search"
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
							}}
						/>
						<select
							className="form-control w-auto"
							value={eventStatus}
							onChange={(event) => {
								setEventStatus(event.target.value);
							}}
						>
							<option value="ALL">All</option>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
							<option value="REJECTED">Rejected</option>
						</select>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								setPage((prev) => prev - 1);
							}}
							className={`btn ${page > 1 ? "btn-info" : "btn-secondary"} border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1`}
						>
							<span>{"← " + (page - 1)}</span>
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							disabled={true}
							className={`btn btn-info border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1`}
						>
							<span>{page}</span>
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								setPage((prev) => prev + 1);
							}}
							className="btn btn-secondary border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
						>
							<span>{"→ " + (page + 1)}</span>
						</motion.button>
					</div>
				</div>

				{displayEvents.length > 0 ? (
					<div className="row g-4">
						{displayEvents.map((event) => (
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
		</div>
	);
};

export default Events;
