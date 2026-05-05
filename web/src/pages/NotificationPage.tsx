import { useEffect, useState, useRef } from "react";
import NotificationComponent from "../components/NotificationComponent";
import toast from "react-hot-toast";

interface Notification {
	id: number;
	type: string;
	text: string;
	time: number;
	isRead: boolean;
	priority: "high" | "medium" | "low";
}

type DisplayFilter = "all" | "unread" | "read";

const NotificationPage: React.FC = () => {
	const emsNotifications: Notification[] = [
		{
			id: 1,
			type: "Booking",
			text: 'New ticket purchase for "Tech Conference 2026" by Deepavignesh.',
			time: Date.now(),
			isRead: false,
			priority: "high",
		},
		{
			id: 2,
			type: "Venue",
			text: "Grand Ballroom has been confirmed for the Charity Gala.",
			time: Date.now() - 3600000,
			isRead: false,
			priority: "medium",
		},
		{
			id: 3,
			type: "Task",
			text: 'Team Lead assigned you to "Setup Registration Desk" for tomorrow.',
			time: Date.now() - 10800000,
			isRead: true,
			priority: "low",
		},
		{
			id: 4,
			type: "System",
			text: "Weekly security report for stock securities is ready for download.",
			time: Date.now() - 86400000,
			isRead: true,
			priority: "low",
		},
		{
			id: 5,
			type: "Booking",
			text: 'Early bird registration for "React Developers Meetup" is now 90% full.',
			time: Date.now() - 300000,
			isRead: false,
			priority: "high",
		},
		{
			id: 6,
			type: "Venue",
			text: "Equipment check: Projector and Sound System verified for Room 302.",
			time: Date.now() - 900000,
			isRead: false,
			priority: "medium",
		},
		{
			id: 7,
			type: "Payment",
			text: 'Invoice #8842 for "Corporate Retreat" has been marked as paid.',
			time: Date.now() - 2700000,
			isRead: false,
			priority: "medium",
		},
		{
			id: 8,
			type: "Task",
			text: 'Reminder: Finalize the catering menu for the "Product Launch" by EOD.',
			time: Date.now() - 7200000,
			isRead: false,
			priority: "high",
		},
		{
			id: 9,
			type: "System",
			text: "Database backup completed successfully for the Quote of the Day module.",
			time: Date.now() - 14400000,
			isRead: true,
			priority: "low",
		},
		{
			id: 10,
			type: "Booking",
			text: 'Cancellation: 2 tickets returned for "Annual Gala Night". Waitlist notified.',
			time: Date.now() - 21600000,
			isRead: true,
			priority: "medium",
		},
		{
			id: 11,
			type: "Venue",
			text: 'Conflict detected: "Board Meeting" and "Workshop A" both requested Hall B.',
			time: Date.now() - 86400000,
			isRead: true,
			priority: "high",
		},
		{
			id: 12,
			type: "Task",
			text: 'Volunteer onboarding: 5 new members joined the "Green Earth Expo" team.',
			time: Date.now() - 90000000,
			isRead: true,
			priority: "low",
		},
		{
			id: 13,
			type: "System",
			text: "API Rate limit reached: Stock securities data sync paused for 15 minutes.",
			time: Date.now() - 172800000,
			isRead: true,
			priority: "medium",
		},
		{
			id: 14,
			type: "Payment",
			text: "Refund processed for ticket ID #9901 (Deepavignesh).",
			time: Date.now() - 175000000,
			isRead: true,
			priority: "low",
		},
	];

	const [allNotifications, setAllNotifications] = useState<Notification[]>(emsNotifications);
	const [display, setDisplay] = useState<DisplayFilter>("unread");
	const isFirstRender = useRef<boolean>(true);

	const filteredArray = allNotifications
		.filter((n) => {
			if (display === "unread") return !n.isRead;
			if (display === "read") return n.isRead;
			return true;
		})
		.sort((a, b) => b.time - a.time);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		toast(`Viewing ${display} notifications`);
	}, [display]);

	const handleMarkAsRead = (id: number): void => {
		setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
		toast.success("Marked as read");
	};

	const deleteNotification = (id: number): void => {
		setAllNotifications((prev) => prev.filter((n) => n.id !== id));
		toast("Notification Deleted 🗑️");
	};

	return (
		<div>
			<div className="container-fluid bg-body-tertiary min-vh-100 p-0">
				<div className="row g-0">
					{/* Sidebar for larger screens */}
					<aside className="col-md-3 col-lg-2 d-none d-md-flex flex-column vh-100 sticky-top bg-body border-end shadow-sm">
						<div className="p-4">
							<div className="nav flex-column nav-pills gap-2">
								<button
									className={`nav-link text-start ${display === "all" ? "active" : ""}`}
									onClick={() => setDisplay("all")}
								>
									All
								</button>
								<button
									className={`nav-link text-start ${display === "unread" ? "active" : ""}`}
									onClick={() => setDisplay("unread")}
								>
									Unread
								</button>
								<button
									className={`nav-link text-start ${display === "read" ? "active" : ""}`}
									onClick={() => setDisplay("read")}
								>
									Read
								</button>
							</div>
						</div>
					</aside>

					<main className="col-md-9 col-lg-10">
						<header
							className="sticky-top bg-body bg-opacity-75 border-bottom p-3 shadow-sm"
							style={{ backdropFilter: "blur(10px)", zIndex: 1020 }}
						>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="text-capitalize m-0 fw-bold">{display} Notifications</h4>
							</div>

							<div className="input-group mb-2">
								<input type="text" className="form-control" placeholder="Search..." />
								<button className="btn btn-primary px-4">Search</button>
							</div>

							{/* alternate for sidebar - small screens*/}
							<div className="d-flex d-md-none gap-2 mt-3">
								<button
									className={`btn btn-sm ${display === "all" ? "btn-primary" : "btn-outline-primary"}`}
									onClick={() => setDisplay("all")}
								>
									All
								</button>
								<button
									className={`btn btn-sm ${display === "unread" ? "btn-primary" : "btn-outline-primary"}`}
									onClick={() => setDisplay("unread")}
								>
									Unread
								</button>
								<button
									className={`btn btn-sm ${display === "read" ? "btn-primary" : "btn-outline-primary"}`}
									onClick={() => setDisplay("read")}
								>
									Read
								</button>
							</div>
						</header>

						<div className="p-4">
							{filteredArray.length > 0 ? (
								filteredArray.map((note) => (
									<NotificationComponent
										key={note.id}
										details={note}
										onMarkRead={() => handleMarkAsRead(note.id)}
										deleteNotification={() => deleteNotification(note.id)}
									/>
								))
							) : (
								<div className="text-center py-5 mt-5">
									<h5 className="text-muted fw-light">No {display} notifications found.</h5>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};

export default NotificationPage;
