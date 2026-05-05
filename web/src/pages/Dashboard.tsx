import { useNavigate } from "react-router";
import TabBar from "../components/TabBar";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const user = useAuthStore((s) => s.user)!;

	useEffect(() => {
		if (!isAuthenticated) navigate("/login");
		if (user.role && user.role === "ADMIN") navigate("/admin");
	}, []);

	if (!isAuthenticated) return null;

	return <TabBar />;
};

export default Dashboard;
