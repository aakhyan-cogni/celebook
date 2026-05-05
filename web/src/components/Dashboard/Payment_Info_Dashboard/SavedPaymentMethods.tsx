import { useState } from "react";

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

// Cards
export function Cards() {
	const cards = [
		{ id: "1", cardNo: "1234567812345678", expiryNo: "06/27", brand: "BOB", type: "Credit" },
		{ id: "2", cardNo: "4111111111111111", expiryNo: "05/26", brand: "SBI", type: "Credit" },
		{ id: "3", cardNo: "5555444433331111", expiryNo: "07/28", brand: "HDFC", type: "Debit" },
	];

	const maskCard = (num = "") => (num.length >= 4 ? `**** **** **** ${num.slice(-4)}` : "**** **** **** ****");

	return (
		<div className="row g-3">
			{cards.map((c) => (
				<div key={c.id} className="col-12 col-lg-6 d-flex">
					<div
						className="card w-100 shadow-sm border-0 overflow-hidden"
						style={{
							borderRadius: 16,
							background: "linear-gradient(135deg, #0D6EFD, #212529)",
						}}
					>
						<div className="card-body text-white">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<span className="badge bg-dark bg-opacity-25 text-white">{c.type}</span>
								<span className="fw-semibold">{c.brand}</span>
							</div>

							<div className="fs-5 fw-bold">{maskCard(c.cardNo)}</div>

							<div className="d-flex justify-content-between mt-2">
								<div>
									<small className="text-white-50 d-block">Expiry</small>
									<span className="fw-semibold">{c.expiryNo}</span>
								</div>
								<div className="text-end">
									<small className="text-white-50 d-block">Brand</small>
									<span className="fw-semibold">{c.brand}</span>
								</div>
							</div>

							<div className="mt-3 d-flex gap-2">
								<button type="button" className="btn btn-light btn-sm text-primary">
									Set Default
								</button>
								<button type="button" className="btn btn-outline-light btn-sm">
									Remove
								</button>
							</div>
						</div>
					</div>
				</div>
			))}

			{/* Add Card tile */}
			<div className="col-12 col-lg-6 d-flex">
				<button
					type="button"
					className="card w-100 shadow-sm border-0 overflow-hidden text-white"
					style={{
						borderRadius: 16,
						background: "linear-gradient(135deg, #6c757d, #343a40)",
						cursor: "pointer",
					}}
					onClick={() => console.log("Add Card")}
				>
					<div
						className="card-body d-flex align-items-center justify-content-center"
						style={{ minHeight: 120 }}
					>
						<div className="fs-5 fw-bold">+ Add Card</div>
					</div>
				</button>
			</div>
		</div>
	);
}

// UPIs
export function Upis() {
	const upis = [
		{ id: "u1", vpa: "sushant@okhdfcbank", name: "Primary UPI", linkedBank: "HDFC" },
		{ id: "u2", vpa: "sushant@oksbi", name: "SBI UPI", linkedBank: "SBI" },
	];

	return (
		<div className="row g-3">
			{upis.map((u) => (
				<div key={u.id} className="col-12 col-lg-6 d-flex">
					<div
						className="w-100 border rounded-3 p-3 shadow-sm "
						style={{
							borderColor: "#dee2e6",
							minHeight: 120,
						}}
					>
						<div className="d-flex justify-content-between align-items-start">
							<div className="d-flex align-items-center gap-2">
								<span className="badge text-bg-info">UPI</span>
								<span className="fw-semibold">{u.name}</span>
							</div>
							<span className="text-muted small">{u.linkedBank}</span>
						</div>

						<div className="mt-2">
							<div className="text-body fw-semibold">{u.vpa}</div>
							<small className="text-muted">Virtual Payment Address</small>
						</div>

						<div className="mt-3 d-flex gap-2">
							<button type="button" className="btn btn-outline-primary btn-sm">
								Set Default
							</button>
							<button type="button" className="btn btn-outline-secondary btn-sm">
								Remove
							</button>
						</div>
					</div>
				</div>
			))}

			{/* Add UPI tile */}
			<div className="col-12 col-lg-6 d-flex">
				<button
					type="button"
					className="w-100 border rounded-3 p-3 bg-dark text-primary d-flex align-items-center justify-content-center"
					style={{ minHeight: 120, borderStyle: "dashed" }}
					onClick={() => console.log("Add UPI")}
				>
					+ Add UPI
				</button>
			</div>
		</div>
	);
}

// Bank Accounts
export function Accounts() {
	const accounts = [
		{ id: "a1", bank: "HDFC Bank", accMasked: "XXXXXX1234", ifsc: "HDFC0000123", type: "Savings" },
		{ id: "a2", bank: "SBI", accMasked: "XXXXXX9876", ifsc: "SBIN0000456", type: "Current" },
	];

	return (
		<div className="row g-3">
			{accounts.map((a) => (
				<div key={a.id} className="col-12 col-lg-6 d-flex">
					<div className="card w-100 shadow-sm border-0">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div className="d-flex align-items-center gap-2">
									<div
										className="rounded-circle d-inline-block"
										style={{
											width: 36,
											height: 36,
											background: "#0d6efd",
											opacity: 0.15,
										}}
									/>
									<div>
										<div className="fw-semibold">{a.bank}</div>
										<small className="text-muted">{a.type}</small>
									</div>
								</div>
								<span className="badge text-bg-secondary">Bank</span>
							</div>

							<div className="mt-3">
								<div className="d-flex justify-content-between">
									<div>
										<small className="text-muted d-block">Account</small>
										<span className="fw-semibold">{a.accMasked}</span>
									</div>
									<div className="text-end">
										<small className="text-muted d-block">IFSC</small>
										<span className="fw-semibold">{a.ifsc}</span>
									</div>
								</div>
							</div>

							<div className="mt-3 d-flex gap-2">
								<button type="button" className="btn btn-outline-primary btn-sm">
									Set Default
								</button>
								<button type="button" className="btn btn-outline-secondary btn-sm">
									Remove
								</button>
							</div>
						</div>
					</div>
				</div>
			))}

			{/* Add Account tile */}
			<div className="col-12 col-lg-6 d-flex">
				<button
					type="button"
					className="card w-100 border-0 shadow-sm text-primary"
					onClick={() => console.log("Add Bank Account")}
					style={{ minHeight: 120 }}
				>
					<div className="card-body d-flex align-items-center justify-content-center">+ Add Bank Account</div>
				</button>
			</div>
		</div>
	);
}

export default SavedPaymentMethods;
``;
