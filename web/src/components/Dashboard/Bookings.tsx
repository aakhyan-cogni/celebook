import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { EventCard } from "../EventCard";
import { useAuthStore } from "../../store/useAuthStore";
import { apiFetch } from "../../lib/api";
import type { Booking } from "../../store";

type StatusFilter = "ALL" | "CONFIRMED" | "CANCELLED";

export default function Bookings() {
	const navigate = useNavigate();
	const accessToken = useAuthStore((s) => s.accessToken);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<StatusFilter>("ALL");

	useEffect(() => {
		if (isAuthenticated && !accessToken) {
			setLoading(true);
			return;
		}
		if (!accessToken) return;

		let cancelled = false;
		const load = async () => {
			setLoading(true);
			try {
				const res = await apiFetch("/registrations/my-registrations", { method: "GET" });
				if (cancelled) return;
				// Controller wraps the array in { success, data: [...] }.
				const list: Booking[] = res?.data ?? res ?? [];
				setBookings(list);
			} catch (err) {
				console.error("Failed to load bookings:", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [accessToken, isAuthenticated]);

	const displayBookings = useMemo(() => {
		const term = search.trim().toLowerCase();
		return bookings.filter((b) => {
			if (status !== "ALL" && b.status !== status) return false;
			if (!term) return true;
			const ev = b.eventId as any;
			if (!ev) return false;
			const haystack = [ev.title, ev.description, ev.category, ev.location, ev.organizerEmail]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(term);
		});
	}, [bookings, search, status]);

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
			<section className="mb-5">
				<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
					<h3 className="fw-bold mb-0">Your Bookings</h3>
					<div className="d-flex gap-2 align-items-center flex-wrap">
						<input
							className="form-control w-auto"
							type="search"
							placeholder="Search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<select
							className="form-select w-auto"
							value={status}
							onChange={(e) => setStatus(e.target.value as StatusFilter)}
						>
							<option value="ALL">All</option>
							<option value="CONFIRMED">Confirmed</option>
							<option value="CANCELLED">Cancelled</option>
						</select>
					</div>
				</div>

				{displayBookings.length > 0 ? (
					<div className="row g-4">
						{displayBookings.map((booking) => {
							const ev = booking.eventId as any;
							if (!ev) return null;
							const evId = ev.id ?? ev._id;
							const bookingId = (booking as any)._id ?? (booking as any).id ?? evId;
							return (
								<div key={bookingId} className="col-md-6 col-lg-4">
									<div className="position-relative">
										<div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
											<span
												className={`badge px-3 py-2 shadow-sm ${
													booking.status === "CANCELLED" ? "bg-danger" : "bg-success"
												}`}
											>
												{booking.status === "CANCELLED" ? "Cancelled" : "Confirmed"}
											</span>
										</div>
										<EventCard
											event={{ ...ev, id: evId }}
											onClick={() => navigate(`/events/${evId}`, { state: { eventData: ev } })}
										/>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-2">
							{bookings.length === 0
								? "You haven't booked any events yet."
								: "No bookings match the current filters."}
						</p>
						{bookings.length === 0 && (
							<button
								className="btn btn-primary rounded-pill px-4 my-2"
								onClick={() => navigate("/events")}
							>
								Discover events
							</button>
						)}
					</div>
				)}
			</section>
		</div>
	);
}
