import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BookingHistory from "../components/Dashboard/BookingHistory";

export default function BookingHistoryPage() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const user = useAuthStore((s) => s.user);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
		}
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated || !user) return null;

	return (
		<div className="container py-4">
			<div className="card shadow-sm">
				<div className="card-body">
					<BookingHistory />
				</div>
			</div>
		</div>
	);
}
