// Cards
export default function Cards() {
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