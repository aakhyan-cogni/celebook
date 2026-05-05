export function PricingCard(props: PricingCardProps) {
	let { description, features, price, title, active, popular } = props;

	return (
		<div className={`card h-100 my-2 py-2 shadow-sm ${active ? "border-primary border-2" : ""}`}>
			<div className="card-body d-flex flex-column">
				<div className="d-flex justify-content-center align-items-center pb-2">
					<h3 className="card-title text-center">{title}</h3>
					{popular && <span className="position-absolute end-0 me-4 rounded-pill bg-primary px-2" style={{ fontSize: "14px"}}>Popular</span>}
				</div>
				<h2 className="text-center mb-3">
					{price}
					<span className="text-muted fs-6">/month</span>
				</h2>
				<p className="card-text text-muted text-center">{description}</p>

				<ul className="list-group-item ms-4 my-4 flex-grow-1">
					{features.map((feature, index) => (
						<li key={index} className="mb-2">
							<i className="bi bi-check2 text-success me-2"></i> {feature}
						</li>
					))}
				</ul>

				<button className={`btn w-100 ${active ? "btn-primary" : "btn-outline-primary"}`}>Get Started</button>
			</div>
		</div>
	);
}

export interface PricingCardProps {
	active?: boolean;
	title: string;
	description: string;
	features: string[];
	price: string;
	popular?: boolean;
}
