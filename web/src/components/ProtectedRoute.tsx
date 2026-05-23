import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

function HydrationSpinner() {
	return (
		<div className="d-flex justify-content-center align-items-center p-5">
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">Loading...</span>
			</div>
		</div>
	);
}

export default function ProtectedRoute() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const accessToken = useAuthStore((s) => s.accessToken);

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!accessToken) return <HydrationSpinner />;
	return <Outlet />;
}

export function AdminRoute() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const accessToken = useAuthStore((s) => s.accessToken);
	const user = useAuthStore((s) => s.user);

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!accessToken || !user) return <HydrationSpinner />;
	if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
	return <Outlet />;
}
