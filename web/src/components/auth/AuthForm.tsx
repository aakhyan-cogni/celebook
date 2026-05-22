import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import FieldError from "../../lib/validation/FieldError";
import type { FieldErrors } from "../../lib/validation/useFormErrors";

interface AuthFormProps {
	isLogin: boolean;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	onToggle: () => void;
	errors?: FieldErrors;
	onFieldChange?: (name: string, value: string | boolean) => void;
}

export default function AuthForm({ isLogin, onSubmit, onToggle, errors = {}, onFieldChange }: AuthFormProps) {
	const cls = (name: string, base = "form-control rounded-pill border-primary border-opacity-25") =>
		`${base}${errors[name] ? " is-invalid" : ""}`;

	return (
		<div className="card shadow-lg border-0 rounded-4 mt-4 bg-body-tertiary backdrop-blur p-4 p-md-5">
			<div className="text-center mb-4">
				<motion.span
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="badge rounded-pill text-bg-primary mb-3 px-3 py-2 shadow-sm"
				>
					EMS Secure Portal
				</motion.span>
				<h2 className="fw-bold text-body-emphasis">{isLogin ? "Welcome Back" : "Join EMS"}</h2>
				<p className="text-muted small">
					{isLogin
						? "Enter your credentials to manage your events."
						: "Create an account to start hosting experiences."}
				</p>
			</div>

			<form onSubmit={onSubmit} noValidate>
				<AnimatePresence mode="popLayout">
					{!isLogin && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mb-3"
						>
							<label className="form-label fw-semibold small">Full Name</label>
							<input
								name="name"
								type="text"
								className={cls("name")}
								placeholder="John Doe"
								onChange={(e) => onFieldChange?.("name", e.target.value)}
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? "auth-name-error" : undefined}
							/>
							<FieldError id="auth-name-error" message={errors.name} />
						</motion.div>
					)}
				</AnimatePresence>

				<div className="mb-3">
					<label className="form-label fw-semibold small">Email Address</label>
					<input
						name="email"
						type="email"
						className={cls("email")}
						placeholder="name@example.com"
						onChange={(e) => onFieldChange?.("email", e.target.value)}
						aria-invalid={!!errors.email}
						aria-describedby={errors.email ? "auth-email-error" : undefined}
					/>
					<FieldError id="auth-email-error" message={errors.email} />
				</div>

				<div className="mb-4">
					<label className="form-label fw-semibold small">Password</label>
					<input
						name="password"
						type="password"
						className={cls("password")}
						placeholder="••••••••"
						onChange={(e) => onFieldChange?.("password", e.target.value)}
						aria-invalid={!!errors.password}
						aria-describedby={errors.password ? "auth-password-error" : undefined}
					/>
					<FieldError id="auth-password-error" message={errors.password} />
					{!isLogin && !errors.password && (
						<div className="form-text small">At least 8 characters, with letters and a number.</div>
					)}
				</div>

				<AnimatePresence mode="popLayout">
					{!isLogin && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mb-3"
						>
							<div className="form-check">
								<input
									type="checkbox"
									className={`form-check-input${errors.termsAccepted ? " is-invalid" : ""}`}
									id="termsAccepted"
									name="termsAccepted"
									onChange={(e) => onFieldChange?.("termsAccepted", e.target.checked)}
									aria-invalid={!!errors.termsAccepted}
								/>
								<label className="form-check-label small" htmlFor="termsAccepted">
									I agree to the{" "}
									<Link
										to="/terms"
										className="text-primary fw-semibold"
										target="_blank"
										rel="noopener noreferrer"
									>
										Terms and Conditions
									</Link>
								</label>
							</div>
							<FieldError message={errors.termsAccepted} />
						</motion.div>
					)}
				</AnimatePresence>

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					type="submit"
					className="btn btn-primary w-100 btn-lg rounded-pill shadow mb-3"
				>
					{isLogin ? "Sign In" : "Register Now"}
				</motion.button>
			</form>

			<div className="text-center mt-3">
				<p className="text-muted small mb-1">
					{isLogin ? "Don't have an account?" : "Already have an account?"}
				</p>
				<button onClick={onToggle} className="btn btn-link text-primary fw-bold text-decoration-none p-0">
					{isLogin ? "Create Account →" : "← Back to Login"}
				</button>
			</div>
		</div>
	);
}
