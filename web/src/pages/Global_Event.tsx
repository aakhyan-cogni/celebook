import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router";
import { EventCard } from "../components/EventCard";
import Events from "./Event";
import { useLocalDB, type Event } from "../store";

const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function GlobalEventPage() {
	const navigate = useNavigate();
	const events = useLocalDB((s) => s.events);
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLocation, setSelectedLocation] = useState("All");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [eventData, _] = useState<Event[]>(events);

	const activeEventId = searchParams.get("q");

	const categories = [
		"All",
		"Workshop",
		"Conference",
		"Social",
		"Entertainment",
		"Health & Wellness",
		"Education",
		"Other",
	];

	const sortedAndFilteredEvents = useMemo(() => {
		const now = Date.now();
		const filtered = eventData.filter((event) => {
			const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesLoc = selectedLocation === "All" || event.location.includes(selectedLocation);
			const matchesCat = selectedCategory === "All" || event.category === selectedCategory;
			return matchesSearch && matchesLoc && matchesCat;
		});

		return filtered.sort((a, b) => {
			const timeA = new Date(a.date).getTime();
			const timeB = new Date(b.date).getTime();
			const isPastA = timeA < now;
			const isPastB = timeB < now;
			if (isPastA && !isPastB) return 1;
			if (!isPastA && isPastB) return -1;
			return !isPastA && !isPastB ? timeA - timeB : timeB - timeA;
		});
	}, [eventData, searchTerm, selectedLocation, selectedCategory]);

	if (activeEventId) {
		return <Events />;
	}

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
								onChange={(e) => setSelectedLocation(e.target.value)}
							>
								<option value="All">Global</option>
								<option value="New York">New York</option>
								<option value="London">London</option>
							</select>
							<input
								type="text"
								className="form-control border-0 bg-transparent shadow-none"
								placeholder="Search events..."
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setSelectedCategory(cat)}
							className={`btn rounded-pill px-4 fw-bold ${selectedCategory === cat ? "btn-primary" : "btn-outline-primary"}`}
						>
							{cat}
						</button>
					))}
				</div>

				<motion.div variants={staggerContainer} initial="hidden" animate="visible" className="row g-4">
					{sortedAndFilteredEvents.map((event) => (
						<motion.div key={event.id} layout variants={fadeInUp} className="col-12 col-md-6 col-lg-4">
							<EventCard event={event} onClick={() => navigate(`?q=${event.id}`)} />
						</motion.div>
					))}
				</motion.div>
			</main>
		</div>
	);
}
