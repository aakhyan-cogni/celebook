import { useEffect, useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { login as loginUser, register as registerUser } from "../api/auth.api";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import AuthForm from "../components/auth/AuthForm";
import AuthBackground from "../components/auth/AuthBackground";

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Login() {
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();
	const setAuth = useAuthStore((s) => s.setAuth);
	const updateUser = useAuthStore((s) => s.updateUser);
	const setConsentRequired = useAuthStore((s) => s.setConsentRequired);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) navigate("/dashboard");
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const { name, email, password } = Object.fromEntries(formData) as Record<string, string>;
		const termsAccepted = formData.get("termsAccepted") === "on";

		try {
			const response = isLogin
				? await loginUser(email, password)
				: await registerUser(name, email, password, termsAccepted, true);

			setAuth(response.user, response.accessToken);

			// Probe /auth/me right after login so a stale consent version pops the
			// modal immediately (Hydrate's mount-time effect already ran with
			// isAuthenticated=false and won't re-fire).
			try {
				const me = await apiFetch("/auth/me", { method: "GET" });
				if (me?.user) updateUser({ ...me.user });
				setConsentRequired(me?.consent?.needsRenewal === true);
			} catch {
				// Non-critical — defense-in-depth via 403 handler still applies.
			}

			toast.success(response.message || "Success!");
			navigate("/dashboard");
		} catch (error: any) {
			toast.error(error.message || "Authentication failed");
		}
	};

	return (
		<div className="min-vh-100 bg-body position-relative overflow-hidden d-flex align-items-center justify-content-center">
			<AuthBackground />
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
				className="container position-relative"
				style={{ zIndex: 1, maxWidth: "450px" }}
			>
				<AuthForm isLogin={isLogin} onSubmit={handleSubmit} onToggle={() => setIsLogin(!isLogin)} />
			</motion.div>
		</div>
	);
}
