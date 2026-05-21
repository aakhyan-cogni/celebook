import { useEffect, useState } from "react";
import PlanCard from "./PlanCard";
import { apiFetch } from "../../../lib/api.ts";
import { Loader2 } from "lucide-react";

interface PlanMetadata {
	title: string;
	price: string;
	features: string[];
	active: boolean;
}

export default function SubscriptionPlans() {
	const [plans, setPlans]             = useState<Record<string, PlanMetadata>>({});
	const [currentTier, setCurrentTier] = useState<string>("FREE");
	const [currentTierTitle, setCurrentTierTitle] = useState<string>("Basic");
	const [loading, setLoading]         = useState<boolean>(true);
	const [error, setError]             = useState<string | null>(null);

	const fetchPlanDetails = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await apiFetch("/plans", { method: "GET" });
			if (res.success) {
				setPlans(res.plans);
				setCurrentTier(res.currentTier);           // "FREE" | "PRO" | "ULTIMATE"
				setCurrentTierTitle(res.currentTierTitle); // "Basic" | "Pro" | "Ultimate"
			} else {
				setError(res.message || "Failed to load subscription details.");
			}
		} catch (err: any) {
			setError(err.message || "Failed to load subscription details.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchPlanDetails(); }, []);

	const handleUpgradeSuccess = (newTier: string) => {
		setCurrentTier(newTier);
		fetchPlanDetails();
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center h-100 min-vh-50">
				<Loader2 className="animate-spin text-info" size={40} />
			</div>
		);
	}

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className="bg-info rounded-circle mx-2" style={{ width: 10, height: 10 }} />
					<h4 className="mt-1 text-info">Subscription &amp; Plans</h4>
				</div>
				<hr className="my-2 border-info border-2 opacity-95" />
			</div>

			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				{error && <div className="alert alert-danger mx-2">{error}</div>}

				<div className="row g-4 align-items-stretch mt-1">
					{Object.keys(plans).map((tierKey) => {
						const plan = plans[tierKey];
						return (
							<div key={tierKey} className="col-12 col-md-4">
								<PlanCard
									title={plan.title}
									price={plan.price}
									features={plan.features}
									active={plan.active}
									currentTierTitle={currentTierTitle}
									onUpgradeSuccess={handleUpgradeSuccess}
								/>
							</div>
						);
					})}
				</div>

				<div className="row mt-4">
					<div className="col-12 pb-5 flex-column justify-content-center">
						<div className="m-2 p-2">
							<label className="form-label fw-bold fs-4">Current Subscription Level</label>
							<br />
							<label className="form-label fw-semibold fs-5 text-info text-uppercase">
								{currentTier} Plan
							</label>
						</div>
						<div className="alert alert-info mx-2" role="alert">
							🔥 You can seamlessly toggle or upgrade your membership preferences above at any time.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}