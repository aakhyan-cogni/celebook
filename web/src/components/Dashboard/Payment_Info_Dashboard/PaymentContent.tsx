import { useState } from "react";
import SavedPaymentMethods from "./SavedPaymentMethods";
import TransactionHistory from "./TransactionHistory";
import SubscriptionPlans from "./SubscriptionPlans";

export default function PaymentContent() {
	const [step, setStep] = useState(0);

	const contents = [<SavedPaymentMethods />, <TransactionHistory />, <SubscriptionPlans />];

	const content = contents[step];

	function handleSaveNext() {
		setStep((prev) => (prev + 1) % contents.length);
	}

	function handlePrevious() {
		setStep((prev) => Math.max(prev - 1, 0));
	}

	const isFirst = step === 0;
	const isLast = step === contents.length - 1;

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{content}

			<div className="row">
				<div className="col-12 d-flex align-items-between justify-content-between">
					<button
						onClick={handlePrevious}
						disabled={isFirst}
						className={`float-start w-25 text-dark border-none form-control rounded-2 ${
							isFirst ? "bg-secondary" : "bg-info"
						}`}
					>
						Previous
					</button>

					<button
						onClick={handleSaveNext}
						disabled={isLast}
						className={` ${isLast ? "bg-secondary" : "bg-info"} float-end  w-25 text-dark border-none form-control rounded-2`}
					>
						{"Next"}
					</button>
				</div>
			</div>
		</div>
	);
}
