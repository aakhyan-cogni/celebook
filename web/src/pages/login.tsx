import { useEffect, useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { login as loginUser, register as registerUser } from "../api/auth.api";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import AuthForm from "../components/auth/AuthForm";
import AuthBackground from "../components/auth/AuthBackground";
import { loginSchema, registerSchema } from "../lib/validation/schemas";
import { useFormErrors } from "../lib/validation/useFormErrors";

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

	const schema = isLogin ? loginSchema : registerSchema;
	const { errors, validate, clear, setErrors } = useFormErrors(schema);

	useEffect(() => {
		if (isAuthenticated) navigate("/dashboard");
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		setErrors({});
	}, [isLogin, setErrors]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const raw = Object.fromEntries(formData) as Record<string, string>;
		const payload = isLogin
			? { email: raw.email ?? "", password: raw.password ?? "" }
			: {
					name: raw.name ?? "",
					email: raw.email ?? "",
					password: raw.password ?? "",
					termsAccepted: formData.get("termsAccepted") === "on",
				};

		const result = validate(payload);
		if (!result.ok) {
			toast.error("Please fix the errors highlighted below");
			return;
		}

		try {
			const data = result.data as any;
			const response = isLogin
				? await loginUser(data.email, data.password)
				: await registerUser(data.name, data.email, data.password, data.termsAccepted, true);

			setAuth(response.user, response.accessToken);

			try {
				const me = await apiFetch("/auth/me", { method: "GET" });
				if (me?.user) updateUser({ ...me.user });
				setConsentRequired(me?.consent?.needsRenewal === true);
			} catch (e) {
				console.error("Failed to fetch user data after authentication", e);
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
				<AuthForm
					isLogin={isLogin}
					onSubmit={handleSubmit}
					onToggle={() => setIsLogin(!isLogin)}
					errors={errors}
					onFieldChange={(name) => clear(name)}
				/>
			</motion.div>
		</div>
	);
}
