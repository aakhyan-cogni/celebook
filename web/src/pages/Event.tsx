import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import SingleEvent from "../components/SingleEvent";
import { BASE_URL } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function EventDetailPage() {
	const { id }      = useParams<{ id: string }>();
	const navigate    = useNavigate();
	const accessToken = useAuthStore((s) => s.accessToken);

	const [event,     setEvent]     = useState<any>(null);
	const [loading,   setLoading]   = useState(true);
	const [errorType, setErrorType] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			setErrorType("NOT_FOUND");
			setLoading(false);
			return;
		}

		const fetchEvent = async () => {
			try {
				setLoading(true);
				setErrorType(null);

				const headers: HeadersInit = { "Content-Type": "application/json" };
				if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

				const res = await fetch(`${BASE_URL}/events/${id}`, {
					method: "GET",
					headers,
					credentials: "include",
				});

				if (res.status === 404) { setErrorType("NOT_FOUND");   return; }
				if (res.status === 401) { setErrorType("UNAUTHORIZED"); return; }
				if (res.status === 403) { setErrorType("FORBIDDEN");    return; }
				if (!res.ok)            { setErrorType("ERROR");        return; }

				const data = await res.json();
				setEvent(data);
			} catch {
				setErrorType("ERROR");
			} finally {
				setLoading(false);
			}
		};

		fetchEvent();
	}, [id, accessToken]);

	// ── Loading spinner ─
	if (loading) {
		return (
			<div className="container py-5 text-center">
				<div
					className="spinner-border text-primary"
					role="status"
					style={{ width: "3rem", height: "3rem" }}
				>
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-3 text-body-secondary">Loading event details...</p>
			</div>
		);
	}

	// ── Error screens ─
	const errorConfig: Record<string, { icon: string; title: string; message: string }> = {
		NOT_FOUND: {
			icon: "🔍",
			title: "Event Not Found",
			message: "We couldn't find the event you're looking for. It may have been deleted, or the link might be incorrect.",
		},
		UNAUTHORIZED: {
			icon: "🔒",
			title: "Login Required",
			message: "You need to be logged in to view this event.",
		},
		FORBIDDEN: {
			icon: "🚫",
			title: "Access Denied",
			message: "You don't have access to this event.",
		},
		ERROR: {
			icon: "⚠️",
			title: "Something went wrong",
			message: "We couldn't load this event. Please try again.",
		},
	};

	if (errorType) {
		const cfg = errorConfig[errorType] ?? errorConfig.ERROR;
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="text-center py-5 mt-5"
			>
				<div className="mb-4">
					<div
						className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3 shadow-sm"
						style={{ width: "100px", height: "100px", fontSize: "3rem" }}
					>
						{cfg.icon}
					</div>
				</div>
				<h2 className="fw-bold text-dark mb-2">{cfg.title}</h2>
				<p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px" }}>
					{cfg.message}
				</p>
				<div className="d-flex gap-3 justify-content-center">
					{errorType === "UNAUTHORIZED" ? (
						<button
							onClick={() => navigate("/login")}
							className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold"
						>
							Log In
						</button>
					) : (
						<button
							onClick={() => navigate(-1)}
							className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold"
						>
							Back to Events
						</button>
					)}
					<button
						onClick={() => navigate("/dashboard")}
						className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold"
					>
						Go to Dashboard
					</button>
				</div>
			</motion.div>
		);
	}

	// ── Success ─
	return (
		<motion.div
			initial={{ opacity: 0, y: 0 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="bg-body pt-0 pb-5 d-flex flex-column"
		>
			<div className="container">
				<div className="py-2">
					<button
						onClick={() => navigate(-1)}
						className="btn btn-link text-decoration-none text-primary fw-bold p-0 d-flex align-items-center"
						style={{ fontSize: "0.85rem", transition: "transform 0.2s" }}
						onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-4px)")}
						onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
					>
						<span className="me-2" style={{ fontSize: "1.5rem" }}>←</span>
						Back
					</button>
				</div>
				<hr className="opacity-10 mt-1 mb-4" />
				{event && <SingleEvent event={event} onClose={() => navigate(-1)} />}
			</div>
		</motion.div>
	);
}
