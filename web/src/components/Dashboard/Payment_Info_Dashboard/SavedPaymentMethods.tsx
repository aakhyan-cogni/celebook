import { useState } from "react";
import Cards from "./Payment_Methods/Cards";
import Upis from "./Payment_Methods/UPITs";
import Accounts from "./Payment_Methods/Accounts";

const SavedPaymentMethods = () => {
	const [method, setMethod] = useState("Cards");

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{/* Header */}
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className="bg-info rounded-circle mx-2" style={{ width: 10, height: 10 }} />
					<h4 className="mt-1 text-info">Saved Payment Methods</h4>
				</div>
				<hr className="my-2 border-info border-2 opacity-95" />
			</div>

			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">
						{/* Methods */}
						<div className="col-12">
							<label className="form-label my-2 fw-bold">Select Payment Method</label>
							<select
								name="methods"
								className="form-select my-2"
								onChange={(e) => setMethod(e.target.value)}
								value={method}
							>
								<option value="Cards">Cards</option>
								<option value="UPIs">UPIs</option>
								<option value="Bank Accounts">Bank Accounts</option>
							</select>
						</div>

						{/* Content */}
						<div className="col-12">
							{method === "Cards" && <Cards />}
							{method === "UPIs" && <Upis />}
							{method === "Bank Accounts" && <Accounts />}
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};


export default SavedPaymentMethods;
``;
