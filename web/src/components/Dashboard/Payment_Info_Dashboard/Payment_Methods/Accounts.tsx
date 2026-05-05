// Bank Accounts
export default function Accounts() {
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
