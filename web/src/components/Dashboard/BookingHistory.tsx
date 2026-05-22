import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { apiFetch } from "../../lib/api";
import type { Booking } from "../../store";

function formatDateTime(value: string | undefined | null): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDate(value: string | undefined | null): string {
    const d = value ? new Date(value) : null;
    
    return (d && !isNaN(d.getTime())) 
        ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) 
        : "—";
}

function formatPrice(price: number | undefined | null): string {
	if (price == null) return "—";
	return price === 0 ? "FREE" : `₹${price}`;
}

type Timing = { label: "Past" | "Upcoming" | "—"; className: string };

function getTiming(value: string | undefined | null): Timing {
	if (!value) return { label: "—", className: "bg-secondary-subtle text-secondary-emphasis" };
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) {
		return { label: "—", className: "bg-secondary-subtle text-secondary-emphasis" };
	}
	if (d.getTime() < Date.now()) {
		return { label: "Past", className: "bg-secondary-subtle text-secondary-emphasis" };
	}
	return { label: "Upcoming", className: "bg-info-subtle text-info-emphasis" };
}

export default function BookingHistory() {
	const navigate = useNavigate();
	const accessToken = useAuthStore((s) => s.accessToken);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isAuthenticated && !accessToken) {
			setLoading(true);
			return;
		}
		if (!accessToken) return;

		let cancelled = false;
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await apiFetch("/registrations/history/myBookings", { method: "GET" });
				if (cancelled) return;
				const list: Booking[] = Array.isArray(res) ? res : (res?.data ?? []);
				const valid = list.filter((b) => b && b.eventId && typeof b.eventId === "object");
				setBookings(valid);
			} catch (err) {
				if (cancelled) return;
				console.error("Failed to load booking history:", err);
				setError(err instanceof Error ? err.message : "Failed to load booking history");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
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

	if (error) {
		return (
			<div className="container">
				<h3 className="fw-bold mb-3">Booking History</h3>
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			</div>
		);
	}

	if (bookings.length === 0) {
		return (
			<div className="container">
				<h3 className="fw-bold mb-3">Booking History</h3>
				<div className="text-center p-5 rounded-4 border border-dashed">
					<p className="text-muted mb-2">You haven't booked any events yet.</p>
					<button
						className="btn btn-primary rounded-pill px-4 my-2"
						onClick={() => navigate("/events")}
					>
						Discover events
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<h3 className="fw-bold mb-4">Booking History</h3>

			{/* Desktop / tablet: table with horizontal scroll */}
			<div className="d-none d-md-block table-responsive">
				<table className="table table-hover align-middle">
					<thead className="table-light">
						<tr>
							<th scope="col" style={{ width: "60px" }}>#</th>
							<th scope="col">Event Name</th>
							<th scope="col">Category</th>
							<th scope="col">Date &amp; Time</th>
							<th scope="col">When</th>
							<th scope="col">Price</th>
							<th scope="col">Booked On</th>
							<th scope="col">Status</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((booking, index) => {
							const ev = booking.eventId as any;
							const evId = ev?.id ?? ev?._id;
							const bookingId =
								(booking as any)._id ?? (booking as any).id ?? `${evId}-${index}`;
							const timing = getTiming(ev?.date);
							const handleNavigate = () => {
								if (evId) navigate(`/events/${evId}`);
							};

							return (
								<tr
									key={bookingId}
									onClick={handleNavigate}
									style={{ cursor: evId ? "pointer" : "default" }}
								>
									<td>{index + 1}</td>
									<td className="fw-semibold">{ev?.title ?? "—"}</td>
									<td>
										{ev?.category ? (
											<span className="badge bg-secondary-subtle text-secondary-emphasis">
												{ev.category}
											</span>
										) : (
											"—"
										)}
									</td>
									<td>{formatDateTime(ev?.date)}</td>
									<td>
										<span className={`badge ${timing.className}`}>
											{timing.label}
										</span>
									</td>
									<td>{formatPrice(ev?.price)}</td>
									<td>{formatDate(booking.registeredAt)}</td>
									<td>
										<span
											className={`badge px-3 py-2 ${
												booking.status === "CANCELLED" ? "text-danger" : "text-success"
											}`}
										>
											{booking.status}
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Mobile: cards */}
			<div className="d-md-none d-flex flex-column gap-3">
				{bookings.map((booking, index) => {
					const ev = booking.eventId as any;
					const evId = ev?.id ?? ev?._id;
					const bookingId =
						(booking as any)._id ?? (booking as any).id ?? `${evId}-${index}`;
					const timing = getTiming(ev?.date);
					const handleNavigate = () => {
						if (evId) navigate(`/events/${evId}`);
					};

					return (
						<div
							key={bookingId}
							className="card shadow-sm"
							onClick={handleNavigate}
							role={evId ? "button" : undefined}
							style={{ cursor: evId ? "pointer" : "default" }}
						>
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-2 gap-2">
									<div className="d-flex align-items-center gap-2">
										<span className="text-muted small">#{index + 1}</span>
										<h6 className="mb-0 fw-semibold">{ev?.title ?? "—"}</h6>
									</div>
									<span
										className={`badge px-3 py-2 ${
											booking.status === "CANCELLED" ? "bg-danger" : "bg-success"
										}`}
									>
										{booking.status}
									</span>
								</div>
								<dl className="row mb-0 small">
									<dt className="col-5 text-muted fw-normal">Category</dt>
									<dd className="col-7 mb-1">
										{ev?.category ? (
											<span className="badge bg-secondary-subtle text-secondary-emphasis">
												{ev.category}
											</span>
										) : (
											"—"
										)}
									</dd>

									<dt className="col-5 text-muted fw-normal">Date &amp; Time</dt>
									<dd className="col-7 mb-1">{formatDateTime(ev?.date)}</dd>

									<dt className="col-5 text-muted fw-normal">When</dt>
									<dd className="col-7 mb-1">
										<span className={`badge ${timing.className}`}>
											{timing.label}
										</span>
									</dd>

									<dt className="col-5 text-muted fw-normal">Price</dt>
									<dd className="col-7 mb-1">{formatPrice(ev?.price)}</dd>

									<dt className="col-5 text-muted fw-normal">Booked On</dt>
									<dd className="col-7 mb-0">{formatDate(booking.registeredAt)}</dd>
								</dl>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
