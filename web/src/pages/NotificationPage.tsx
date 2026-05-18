import { useEffect, useMemo, useRef, useState } from "react";
import NotificationComponent from "../components/NotificationComponent";
import toast from "react-hot-toast";
import { useNotificationStore } from "../store/useNotificationStore";

type DisplayFilter = "all" | "unread" | "read";

const NotificationPage: React.FC = () => {
	const notifications = useNotificationStore((s) => s.notifications);
	const loading = useNotificationStore((s) => s.loading);
	const error = useNotificationStore((s) => s.error);
	const hasLoaded = useNotificationStore((s) => s.hasLoaded);
	const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
	const removeNotification = useNotificationStore((s) => s.removeNotification);

	const [display, setDisplay] = useState<DisplayFilter>("unread");
	const [search, setSearch] = useState("");
	const isFirstRender = useRef<boolean>(true);

	useEffect(() => {
		if (!hasLoaded) fetchNotifications();
	}, [hasLoaded, fetchNotifications]);

	const filteredArray = useMemo(() => {
		const q = search.trim().toLowerCase();
		return notifications
			.filter((n) => {
				if (display === "unread" && n.read) return false;
				if (display === "read" && !n.read) return false;
				if (!q) return true;
				return (
					n.title.toLowerCase().includes(q) ||
					n.message.toLowerCase().includes(q) ||
					n.type.toLowerCase().includes(q)
				);
			})
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [notifications, display, search]);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		toast(`Viewing ${display} notifications`);
	}, [display]);

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
		toast.success("Marked as read");
	};

	const handleDelete = async (id: string) => {
		await removeNotification(id);
		toast("Notification deleted");
	};

	const handleMarkAll = async () => {
		await markAllAsRead();
		toast.success("All notifications marked as read");
	};

	return (
		<div>
			<div className="container-fluid bg-body-tertiary min-vh-100 p-0">
				<div className="row g-0">
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
								<button className="btn btn-sm btn-outline-secondary mt-3" onClick={handleMarkAll}>
									Mark all as read
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
								<input
									type="text"
									className="form-control"
									placeholder="Search..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<button className="btn btn-primary px-4" onClick={() => fetchNotifications()}>
									Refresh
								</button>
							</div>

							<div className="d-flex d-md-none gap-2 mt-3 flex-wrap">
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
								<button className="btn btn-sm btn-outline-secondary" onClick={handleMarkAll}>
									Mark all as read
								</button>
							</div>
						</header>

						<div className="p-4">
							{loading && !hasLoaded ? (
								<div className="text-center py-5 mt-5">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
								</div>
							) : error ? (
								<div className="alert alert-danger">{error}</div>
							) : filteredArray.length > 0 ? (
								filteredArray.map((note) => (
									<NotificationComponent
										key={note.id}
										details={{
											id: note.id,
											type: note.type,
											text: `${note.title} — ${note.message}`,
											time: new Date(note.createdAt).getTime(),
											isRead: note.read,
										}}
										onMarkRead={() => handleMarkAsRead(note.id)}
										deleteNotification={() => handleDelete(note.id)}
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
