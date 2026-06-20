import { MailOpen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

interface NotificationDetails {
	id: string | number;
	eventId?: string;
	type: string;
	text: string;
	time: number;
	isRead: boolean;
}

interface Props {
	details: NotificationDetails;
	onMarkRead: () => void;
	deleteNotification: () => void;
}

const NotificationComponent: React.FC<Props> = ({ details, onMarkRead, deleteNotification }) => {
	const navigate = useNavigate();

	const handleClick = () => {
		onMarkRead();
		if (details.type === "EVENT_SUBMITTED") {
			navigate("/admin");
		} else {
			navigate(`/events/${details.eventId}`);
		}
	};

	const date = new Date(details.time)
		.toLocaleString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		})
		.replace(/\//g, "-")
		.replace(",", "");

	return (
		<div
			className={`card mb-3 border-0 shadow-sm ${details.isRead ? "opacity-75" : ""}`}
			onClick={handleClick}
			style={{ cursor: "pointer" }}
		>
			<div className="card-body d-flex flex-column">
				<div className="d-flex align-items-start flex-column">
					<div className="d-flex justify-content-between w-100">
						<span className="badge mb-2 rounded-pill bg-primary">{details.type}</span>
						<small className="d-block text-secondary mb-1 fw-bold">{date}</small>
					</div>
					<div className="d-flex justify-content-between w-100">
						<p className="card-text fw-medium m-0">{details.text}</p>
						<div className="mt-3 d-flex gap-2 w-100 justify-content-end">
							{!details.isRead && (
								<button
									className="btn btn-sm border-0"
									onClick={(e) => {
										e.stopPropagation();
										onMarkRead();
									}}
								>
									<MailOpen />
								</button>
							)}
							<button
								className="btn btn-sm btn-outline-danger border-0"
								onClick={(e) => {
									e.stopPropagation();
									deleteNotification();
								}}
							>
								<Trash2 />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationComponent;
