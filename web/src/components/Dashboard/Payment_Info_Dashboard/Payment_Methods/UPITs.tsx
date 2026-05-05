// UPIs
export default function Upis() {
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