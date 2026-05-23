import React, { useState } from "react";
import BillingModal from "./BillingModal";

type Props = {
	active?: boolean;
	title: string;
	price: string;
	description?: string;
	features: string[];
	popular?: boolean;
	onUpgradeSuccess: (newTier: string) => void;
	currentTierTitle?: string; // e.g. "Basic" | "Pro" | "Ultimate"
};

const TIER_RANK: Record<string, number> = { Basic: 0, Pro: 1, Ultimate: 2 };

const PlanCard: React.FC<Props> = ({
	active,
	title,
	price,
	description,
	features,
	popular,
	onUpgradeSuccess,
	currentTierTitle,
}) => {
	const [showBilling, setShowBilling] = useState(false);

	const currentRank = TIER_RANK[currentTierTitle ?? "Basic"] ?? 0;
	const thisRank = TIER_RANK[title] ?? 0;
	const isDowngrade = thisRank < currentRank;
	const btnLabel = active ? "Current Plan" : isDowngrade ? `Switch to ${title}` : `Upgrade to ${title} →`;

	return (
		<>
			<div
				className={`h-100 d-flex flex-column position-relative overflow-hidden rounded-4 p-4 ${active ? "border border-2 border-info shadow" : "border"}`}
				style={{
					background: active
						? "color-mix(in srgb, var(--bs-info) 8%, var(--bs-body-bg))"
						: "var(--bs-body-bg)",
					transition: "transform 0.22s ease, box-shadow 0.22s ease",
				}}
				onMouseEnter={(e) => {
					if (!active) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
				}}
			>
				{/* Top accent bar */}
				<div
					className="position-absolute top-0 start-0 end-0"
					style={{
						height: 3,
						background: active
							? "linear-gradient(90deg, var(--bs-info), var(--bs-primary))"
							: popular
								? "linear-gradient(90deg, var(--bs-primary), var(--bs-purple, #6610f2))"
								: "var(--bs-border-color)",
						borderRadius: "1rem 1rem 0 0",
					}}
				/>

				{/* Header */}
				<div className="d-flex justify-content-between align-items-start mb-3">
					<div>
						<h4
							className="fw-bold mb-1"
							style={{
								color: active ? "var(--bs-info)" : "var(--bs-body-color)",
								letterSpacing: "-0.02em",
								fontSize: "1.2rem",
							}}
						>
							{title}
						</h4>
						{description && (
							<p className="mb-0 text-body-secondary" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
								{description}
							</p>
						)}
					</div>
					<div className="d-flex flex-column align-items-end gap-1">
						{active && (
							<span
								className="badge"
								style={{
									background: "linear-gradient(90deg, var(--bs-info), var(--bs-primary))",
									fontSize: "0.62rem",
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									padding: "0.28rem 0.65rem",
									borderRadius: "2rem",
									color: "#fff",
								}}
							>
								Active
							</span>
						)}
						{popular && !active && (
							<span
								className="badge bg-primary-subtle text-primary border border-primary"
								style={{
									fontSize: "0.62rem",
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									padding: "0.28rem 0.65rem",
									borderRadius: "2rem",
								}}
							>
								Popular
							</span>
						)}
					</div>
				</div>

				{/* Price */}
				<div className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--bs-border-color)" }}>
					<span
						className="fw-bold"
						style={{
							fontSize: "2.1rem",
							color: "var(--bs-body-color)",
							letterSpacing: "-0.04em",
							lineHeight: 1,
						}}
					>
						{price}
					</span>
					<span className="text-body-secondary ms-1" style={{ fontSize: "0.8rem" }}>
						/ month
					</span>
				</div>

				{/* Features */}
				<ul className="list-unstyled flex-grow-1 mb-4">
					{features.map((feature, i) => (
						<li key={i} className="d-flex align-items-start gap-2 mb-2">
							<span
								className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
								style={{
									width: 17,
									height: 17,
									fontSize: "0.58rem",
									background: active
										? "color-mix(in srgb, var(--bs-info) 18%, transparent)"
										: "var(--bs-secondary-bg)",
									color: active ? "var(--bs-info)" : "var(--bs-secondary-color)",
								}}
							>
								✓
							</span>
							<span className="text-body-secondary" style={{ fontSize: "0.83rem", lineHeight: 1.45 }}>
								{feature}
							</span>
						</li>
					))}
				</ul>

				{/* CTA */}
				{active ? (
					<button
						disabled
						className="btn w-100 rounded-3 fw-semibold"
						style={{
							background: "color-mix(in srgb, var(--bs-info) 12%, transparent)",
							border: "1px solid color-mix(in srgb, var(--bs-info) 35%, transparent)",
							color: "var(--bs-info)",
							fontSize: "0.875rem",
						}}
					>
						Current Plan
					</button>
				) : isDowngrade ? (
					<button
						className="btn btn-outline-secondary w-100 rounded-3 fw-semibold"
						style={{ fontSize: "0.875rem" }}
						onClick={() => setShowBilling(true)}
					>
						{btnLabel}
					</button>
				) : (
					<button
						className="btn w-100 rounded-3 fw-bold"
						style={{
							background: "linear-gradient(90deg, var(--bs-info), var(--bs-primary))",
							border: "none",
							color: "#fff",
							fontSize: "0.875rem",
							boxShadow: "0 4px 18px color-mix(in srgb, var(--bs-primary) 35%, transparent)",
							transition: "opacity 0.2s, transform 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.opacity = "0.88";
							e.currentTarget.style.transform = "scale(1.01)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.opacity = "1";
							e.currentTarget.style.transform = "scale(1)";
						}}
						onClick={() => setShowBilling(true)}
					>
						{btnLabel}
					</button>
				)}
			</div>

			{showBilling && (
				<BillingModal
					plan={{ title, price, features }}
					isDowngrade={isDowngrade}
					onClose={() => setShowBilling(false)}
					onSuccess={(newTier) => {
						setShowBilling(false);
						onUpgradeSuccess(newTier);
					}}
				/>
			)}
		</>
	);
};

export default PlanCard;
