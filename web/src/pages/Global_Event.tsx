import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { EventCard } from "../components/EventCard";
import { apiFetch } from "../lib/api";
import { EVENT_CATEGORIES } from "../components/EventCreationForm/constants";

const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const CATEGORIES = ["All", ...EVENT_CATEGORIES];

export default function GlobalEventPage() {
	const navigate = useNavigate();

	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedLocation, setSelectedLocation] = useState("All");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchEvents = async (search: string, category: string, location: string, currentPage: number) => {
		try {
			setLoading(true);
			setError("");

			const queryParams: Record<string, string> = {
				page: currentPage.toString(),
				limit: "12",
			};
			if (search) queryParams.q = search;
			if (category !== "All") queryParams.category = category;
			if (location !== "All") queryParams.location = location;

			const res = await apiFetch("/events", { method: "GET" }, queryParams);

			setEvents(res.events ?? []);
			setTotalPages(res.pagination?.totalPages ?? 1);
			setTotal(res.pagination?.total ?? 0);
		} catch {
			setError("Failed to load events. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents(searchTerm, selectedCategory, selectedLocation, page);
	}, [page, selectedCategory, selectedLocation]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setSearchTerm(val);
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			setPage(1);
			fetchEvents(val, selectedCategory, selectedLocation, 1);
		}, 400);
	};

	const handleCategoryChange = (cat: string) => {
		setSelectedCategory(cat);
		setPage(1);
	};

	const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedLocation(e.target.value);
		setPage(1);
	};

	return (
		<div className="min-vh-100 bg-body position-relative overflow-hidden">
			<div
				className="position-absolute top-0 start-0 translate-middle bg-primary opacity-10 rounded-circle"
				style={{ width: "600px", height: "600px", filter: "blur(100px)", zIndex: 0 }}
			></div>
			<div
				className="position-absolute bottom-0 end-0 bg-info opacity-10 rounded-circle"
				style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: 0 }}
			></div>

			<main className="container py-5 position-relative" style={{ zIndex: 1 }}>
				<motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-5">
					<h1 className="display-4 fw-bold text-body mb-2">
						Explore <span className="text-primary">Global Events</span>
					</h1>
					<p className="lead text-body-secondary mx-auto" style={{ maxWidth: "600px" }}>
						Discover and book the best experiences happening around you.
					</p>
				</motion.div>

				<div className="row justify-content-center mb-4">
					<div className="col-lg-8">
						<div className="p-2 bg-body-tertiary border border-primary border-opacity-10 rounded-pill shadow d-flex align-items-center px-4 backdrop-blur">
							<select
								className="form-select border-0 bg-transparent fw-bold text-primary w-auto shadow-none"
								value={selectedLocation}
								onChange={handleLocationChange}
							>
								<option value="All">Global</option>
								<option value="New York">New York</option>
								<option value="London">London</option>
								<option value="Chennai">Chennai</option>
								<option value="Mumbai">Mumbai</option>
							</select>
							<input
								type="text"
								className="form-control border-0 bg-transparent shadow-none"
								placeholder="Search events..."
								value={searchTerm}
								onChange={handleSearchChange}
							/>
							{loading && (
								<div
									className="spinner-border spinner-border-sm text-primary ms-2 flex-shrink-0"
									role="status"
								>
									<span className="visually-hidden">Loading...</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => handleCategoryChange(cat)}
							className={`btn rounded-pill px-4 fw-bold ${selectedCategory === cat ? "btn-primary" : "btn-outline-primary"}`}
						>
							{cat}
						</button>
					))}
				</div>

				{error && (
					<div className="alert alert-danger text-center rounded-4">
						{error}
						<button
							className="btn btn-sm btn-outline-danger ms-3"
							onClick={() => fetchEvents(searchTerm, selectedCategory, selectedLocation, page)}
						>
							Retry
						</button>
					</div>
				)}

				{loading && events.length === 0 && (
					<div className="row g-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="col-12 col-md-6 col-lg-4">
								<div className="card border-0 shadow-sm rounded-4 overflow-hidden placeholder-glow">
									<div className="placeholder" style={{ height: "200px" }}></div>
									<div className="card-body p-4">
										<div className="placeholder col-8 mb-2"></div>
										<div className="placeholder col-5 mb-2"></div>
										<div className="placeholder col-12"></div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && !error && events.length === 0 && (
					<div className="text-center py-5">
						<div
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
							style={{ width: "80px", height: "80px", fontSize: "2rem" }}
						>
							🔍
						</div>
						<h5 className="fw-bold text-body">No events found</h5>
						<p className="text-body-secondary">Try adjusting your search or filters.</p>
					</div>
				)}

				{!loading && events.length > 0 && (
					<motion.div variants={staggerContainer} initial="hidden" animate="visible" className="row g-4">
						{events.map((event) => (
							<motion.div key={event._id} layout variants={fadeInUp} className="col-12 col-md-6 col-lg-4">
								<EventCard event={event} onClick={() => navigate(`/events/${event._id}`)} />
							</motion.div>
						))}
					</motion.div>
				)}

				{totalPages > 1 && (
					<div className="d-flex justify-content-center align-items-center gap-3 mt-5">
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => setPage((p) => p - 1)}
							disabled={page <= 1 || loading}
							className={`btn ${page > 1 ? "btn-info" : "btn-secondary"} border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold`}
						>
							{"← " + (page - 1)}
						</motion.button>
						<motion.button
							disabled
							className="btn btn-info border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold"
						>
							{page}
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= totalPages || loading}
							className="btn btn-secondary border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold"
						>
							{"→ " + (page + 1)}
						</motion.button>
						<span className="text-body-secondary small">({total} events)</span>
					</div>
				)}
			</main>
		</div>
	);
}
