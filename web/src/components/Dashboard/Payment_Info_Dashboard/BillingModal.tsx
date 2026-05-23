import React, { useState } from "react";
import { apiFetch } from "../../../lib/api";

interface BillingModalProps {
	plan: { title: string; price: string; features: string[] };
	isDowngrade?: boolean;
	onClose: () => void;
	onSuccess: (newTier: string) => void;
}

type Stage = "billing" | "processing" | "success";

const BillingModal: React.FC<BillingModalProps> = ({ plan, isDowngrade, onClose, onSuccess }) => {
	const [stage, setStage] = useState<Stage>("billing");
	const [error, setError] = useState<string | null>(null);

	const actionLabel = isDowngrade ? "Switch" : "Upgrade";

	const handleConfirm = async () => {
		setError(null);
		setStage("processing");
		await new Promise((r) => setTimeout(r, 2200));
		try {
			const res = await apiFetch("/plans/upgrade", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ planTitle: plan.title }),
			});
			if (res.success) {
				setStage("success");
				setTimeout(() => {
					onSuccess(res.data.tier);
					onClose();
				}, 2000);
			} else {
				setError(res.message || "Failed. Please try again.");
				setStage("billing");
			}
		} catch (err: any) {
			setError(err.message || "Failed. Please try again.");
			setStage("billing");
		}
	};

	return (
		<>
			{/* Backdrop */}
			<div
				onClick={stage === "billing" ? onClose : undefined}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(0,0,0,0.45)",
					backdropFilter: "blur(5px)",
					zIndex: 1050,
					animation: "bmFadeIn 0.18s ease",
				}}
			/>

			{/* Sheet */}
			<div
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1055,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "1rem",
					pointerEvents: "none",
				}}
			>
				<div
					style={{
						pointerEvents: "all",
						width: "100%",
						maxWidth: 400,
						borderRadius: "1.25rem",
						overflow: "hidden",
						animation: "bmSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
						/* glassmorphism surface that reads both themes */
						background: "color-mix(in srgb, var(--bs-body-bg) 88%, transparent)",
						backdropFilter: "blur(20px) saturate(1.6)",
						border: "1px solid color-mix(in srgb, var(--bs-info) 30%, var(--bs-border-color))",
						boxShadow:
							"0 28px 72px rgba(0,0,0,0.28), 0 0 0 1px color-mix(in srgb, var(--bs-info) 10%, transparent)",
					}}
				>
					{/* Top gradient bar */}
					<div
						style={{
							height: 3,
							background:
								"linear-gradient(90deg, var(--bs-info), var(--bs-primary), var(--bs-purple, #6610f2))",
						}}
					/>

					{/* ── BILLING ── */}
					{stage === "billing" && (
						<div className="p-4">
							{/* Header */}
							<div className="d-flex justify-content-between align-items-start mb-4">
								<div>
									<span
										className="text-info fw-semibold"
										style={{
											fontSize: "0.68rem",
											letterSpacing: "0.12em",
											textTransform: "uppercase",
										}}
									>
										{actionLabel} Plan
									</span>
									<h5
										className="fw-bold mb-0 mt-1"
										style={{ color: "var(--bs-body-color)", letterSpacing: "-0.02em" }}
									>
										{plan.title} Membership
									</h5>
								</div>
								<button onClick={onClose} className="btn-close" />
							</div>

							{/* Plan summary card */}
							<div
								className="rounded-3 p-3 mb-4"
								style={{
									background: "var(--bs-secondary-bg)",
									border: "1px solid var(--bs-border-color)",
								}}
							>
								{/* Plan name + price row */}
								<div className="d-flex justify-content-between align-items-center mb-3">
									<div>
										<p
											className="fw-bold mb-0"
											style={{ color: "var(--bs-body-color)", fontSize: "1rem" }}
										>
											{plan.title} Plan
										</p>
										<p className="text-body-secondary mb-0" style={{ fontSize: "0.75rem" }}>
											Billed monthly
										</p>
									</div>
									<div className="text-end">
										<p
											className="fw-bold mb-0 text-info"
											style={{ fontSize: "1.35rem", letterSpacing: "-0.03em" }}
										>
											{plan.price}
										</p>
										<p className="text-body-secondary mb-0" style={{ fontSize: "0.72rem" }}>
											/ month
										</p>
									</div>
								</div>

								{/* Divider */}
								<hr style={{ borderColor: "var(--bs-border-color)", margin: "0 0 0.75rem" }} />

								{/* Feature list */}
								{plan.features.map((f, i) => (
									<div key={i} className="d-flex align-items-center gap-2 mb-1">
										<span
											className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
											style={{
												width: 15,
												height: 15,
												fontSize: "0.55rem",
												background: "color-mix(in srgb, var(--bs-info) 18%, transparent)",
												color: "var(--bs-info)",
											}}
										>
											✓
										</span>
										<span className="text-body-secondary" style={{ fontSize: "0.78rem" }}>
											{f}
										</span>
									</div>
								))}

								{/* Divider + total */}
								<hr style={{ borderColor: "var(--bs-border-color)", margin: "0.75rem 0 0.5rem" }} />
								<div className="d-flex justify-content-between align-items-center">
									<span
										className="fw-semibold"
										style={{ color: "var(--bs-body-color)", fontSize: "0.88rem" }}
									>
										Total due today
									</span>
									<span className="fw-bold text-info" style={{ fontSize: "1.05rem" }}>
										{plan.price}
									</span>
								</div>
							</div>

							{error && (
								<div
									className="alert alert-danger py-2 px-3 mb-3"
									style={{ fontSize: "0.82rem", borderRadius: "0.6rem" }}
								>
									{error}
								</div>
							)}

							{/* CTA */}
							<button
								onClick={handleConfirm}
								className="btn w-100 rounded-3 fw-bold py-2"
								style={{
									background: "linear-gradient(90deg, var(--bs-info), var(--bs-primary))",
									border: "none",
									color: "#fff",
									fontSize: "0.95rem",
									letterSpacing: "0.03em",
									boxShadow: "0 4px 18px color-mix(in srgb, var(--bs-primary) 30%, transparent)",
									transition: "opacity 0.2s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
								onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
							>
								{actionLabel} — {plan.price} / mo
							</button>

							<p className="text-center text-body-secondary mt-3 mb-0" style={{ fontSize: "0.67rem" }}>
								🔒 Secured · Cancel anytime · No hidden fees
							</p>
						</div>
					)}

					{/* ── PROCESSING ── */}
					{stage === "processing" && (
						<div
							className="d-flex flex-column align-items-center justify-content-center text-center p-5"
							style={{ minHeight: 220 }}
						>
							<div style={{ position: "relative", width: 60, height: 60, marginBottom: "1.25rem" }}>
								<svg
									viewBox="0 0 60 60"
									style={{ position: "absolute", inset: 0, animation: "bmSpin 1.1s linear infinite" }}
								>
									<circle
										cx="30"
										cy="30"
										r="24"
										fill="none"
										stroke="var(--bs-border-color)"
										strokeWidth="4"
									/>
									<circle
										cx="30"
										cy="30"
										r="24"
										fill="none"
										stroke="var(--bs-info)"
										strokeWidth="4"
										strokeDasharray="48 108"
										strokeLinecap="round"
									/>
								</svg>
								<div
									style={{
										position: "absolute",
										inset: 14,
										borderRadius: "50%",
										background: "color-mix(in srgb, var(--bs-primary) 20%, transparent)",
										animation: "bmPulse 1.3s ease-in-out infinite",
									}}
								/>
							</div>
							<h6 className="fw-bold mb-1" style={{ color: "var(--bs-body-color)" }}>
								{isDowngrade ? "Switching your plan…" : "Upgrading your plan…"}
							</h6>
							<p className="text-body-secondary mb-0" style={{ fontSize: "0.82rem" }}>
								Activating your {plan.title} membership.
							</p>
						</div>
					)}

					{/* ── SUCCESS ── */}
					{stage === "success" && (
						<div
							className="d-flex flex-column align-items-center justify-content-center text-center p-5"
							style={{ minHeight: 220 }}
						>
							<div
								className="rounded-circle d-flex align-items-center justify-content-center mb-3"
								style={{
									width: 60,
									height: 60,
									background: "linear-gradient(135deg, var(--bs-info), var(--bs-primary))",
									fontSize: "1.6rem",
									color: "#fff",
									boxShadow: "0 0 28px color-mix(in srgb, var(--bs-info) 45%, transparent)",
									animation: "bmPopIn 0.38s cubic-bezier(0.34,1.56,0.64,1)",
								}}
							>
								✓
							</div>
							<h6 className="fw-bold mb-1" style={{ color: "var(--bs-body-color)" }}>
								You're on {plan.title}!
							</h6>
							<p className="text-body-secondary mb-0" style={{ fontSize: "0.82rem" }}>
								Your account has been updated successfully.
							</p>
						</div>
					)}
				</div>
			</div>

			<style>{`
				@keyframes bmFadeIn  { from { opacity:0 } to { opacity:1 } }
				@keyframes bmSlideUp { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:none } }
				@keyframes bmSpin    { to { transform:rotate(360deg) } }
				@keyframes bmPulse   { 0%,100%{ opacity:.4; transform:scale(.92) } 50%{ opacity:1; transform:scale(1.08) } }
				@keyframes bmPopIn   { from { transform:scale(.4); opacity:0 } to { transform:scale(1); opacity:1 } }
			`}</style>
		</>
	);
};

export default BillingModal;
