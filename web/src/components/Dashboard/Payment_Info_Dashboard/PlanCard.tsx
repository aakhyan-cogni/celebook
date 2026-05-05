import React from "react";
import { PricingDetails } from "../../../config/constants";
// import { p } from "motion/react-client";

type props = {
	active?: boolean;
	title: string;
};

const PlanCard: React.FC<props> = ({ active, title }) => {
	const card = PricingDetails[title];

	return (
		<div className={`m-2 p-2 rounded-5 ${active ? "border border-2 border-primary shadow-lg" : "text-center"}`} style={{
							background: "linear-gradient(135deg, #0D6EFD, #212529)",
                            borderImage:"linear-gradient(135deg, #0dcaf0, #212529)"
						}}>
			<div
				className={`${active ? "d-flex justify-content-around" : "bg-info  "} m-1 rounded-start-5 rounded-end-5 fw-bold py-2 `}
			>
				<div className={`${active ? "justify-content-start text-light" : ""} align-self-center `}>
					<h3>{title}</h3>
				</div>
				{active && (
					<div className=" text-light align-self-center justify-content-end fw-lighter rounded-start-5 rounded-end-5 bg-primary px-3 py-1">
						active
					</div>
				)}
			</div>
			<div className="text-center">
				{/* <h3>{PricingDetails.title.description}</h3> */}
                <hr className="mx-2 border border-dark opacity-75"/>
				<p className="py-2 px-1 fw-bold text-light">{card.description}</p>

				{card.features.map((feature, index) => (
					<p key={index} className="text-light fw-semibold">{feature}</p>
				))}
			</div>
		</div>
	);
};

export default PlanCard;
