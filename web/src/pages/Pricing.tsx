import { PricingCard } from "../components/PricingCard";
import { PricingDetails } from "../config/constants";

export default function Pricing() {
	return (
		<div className="container py-4 d-flex align-items-center justify-content-center">
			<div className="row g-4 justify-content-center mx-0">
				{Object.values(PricingDetails).map((plan) => (
					<div className="col-md-4 col-11 mx-auto" key={plan.title}>
						<PricingCard {...plan} />
					</div>
				))}
			</div>
		</div>
	);
}
