const TransactionHistory = () => {
	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{/* Header */}
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className="bg-info rounded-circle mx-2" style={{ width: 10, height: 10 }} />
					<h4 className="mt-1 text-info">Your transanctions</h4>
				</div>
				<hr className="my-2 border-info border-2 opacity-95" />
			</div>

			{/* Table */}
			<div className="mt-2" style={{ height: "28rem"  }}>
				<div className="w-100 h-100 overflow-auto">
					<table className={`w-100 table table-striped table-hover text-center`}>
						<thead className="table-info">
							<tr>
								<th>Date</th>
								<th>Event</th>
								<th>Amount</th>
								<th>Transaction</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>

							<tr>
								<td>{new Date().toLocaleDateString()}</td>
								<td>Event_1</td>
								<td>11000</td>
								<td>Credit</td>
								<td className="text-warning">Pending</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_2</td>
								<td>5000</td>
								<td>Credit</td>
								<td className="text-success">Success</td>
							</tr>
							<tr>
								<td>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
								<td>Event_3</td>
								<td>21000</td>
								<td>Debit</td>
								<td className="text-danger">Failed</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default TransactionHistory;
