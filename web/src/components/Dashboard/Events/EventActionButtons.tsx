interface ActionButtonsProps {
	event: any;
	onEdit: (event: any) => void;
	onPublish: (eventId: string) => void;
	onDuplicate: (eventId: string) => void;
	onAskDelete: (event: any) => void;
	onAskCancel: (event: any) => void;
}

export default function EventActionButtons({
	event,
	onEdit,
	onPublish,
	onDuplicate,
	onAskDelete,
	onAskCancel,
}: ActionButtonsProps) {
	if (event.isCancelled) return null;

	const stop = (e: React.MouseEvent) => e.stopPropagation();

	return (
		<div className="d-flex gap-1 flex-wrap mt-2">
			{event.status === "DRAFT" && (
				<>
					<button
						className="btn btn-sm btn-outline-primary rounded-pill"
						onClick={(e) => {
							stop(e);
							onEdit(event);
						}}
					>
						Edit
					</button>
					<button
						className="btn btn-sm btn-success rounded-pill"
						onClick={(e) => {
							stop(e);
							onPublish(event.id);
						}}
					>
						Publish
					</button>
					<button
						className="btn btn-sm btn-outline-secondary rounded-pill"
						onClick={(e) => {
							stop(e);
							onDuplicate(event.id);
						}}
					>
						Duplicate
					</button>
					<button
						className="btn btn-sm btn-outline-danger rounded-pill"
						onClick={(e) => {
							stop(e);
							onAskDelete(event);
						}}
					>
						Delete
					</button>
				</>
			)}

			{event.status === "PENDING" && (
				<>
					<span className="small text-muted fst-italic align-self-center">
						Awaiting admin review — editing locked
					</span>
					<button
						className="btn btn-sm btn-outline-danger rounded-pill"
						onClick={(e) => {
							stop(e);
							onAskCancel(event);
						}}
					>
						Cancel Event
					</button>
				</>
			)}

			{event.status === "APPROVED" && (
				<>
					<button
						className="btn btn-sm btn-outline-secondary rounded-pill"
						onClick={(e) => {
							stop(e);
							onDuplicate(event.id);
						}}
					>
						Duplicate
					</button>
					<button
						className="btn btn-sm btn-outline-danger rounded-pill"
						onClick={(e) => {
							stop(e);
							onAskCancel(event);
						}}
					>
						Cancel Event
					</button>
				</>
			)}

			{event.status === "REJECTED" && (
				<>
					<button
						className="btn btn-sm btn-primary rounded-pill"
						onClick={(e) => {
							stop(e);
							onEdit(event);
						}}
					>
						Edit & Resubmit
					</button>
					<button
						className="btn btn-sm btn-outline-danger rounded-pill"
						onClick={(e) => {
							stop(e);
							onAskDelete(event);
						}}
					>
						Delete
					</button>
				</>
			)}
		</div>
	);
}
