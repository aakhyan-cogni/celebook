import { Fragment, useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import Dashboard from "./Dashboard/Dashboard";
import PersonalContent from "./Dashboard/Personal_Info_Dashboard/PersonalConent";
import PaymentContent from "./Dashboard/Payment_Info_Dashboard/PaymentContent";
import Events from "./Dashboard/Events";
import Bookings from "./Dashboard/Bookings";
import BookingHistory from "./Dashboard/BookingHistory";
import { TABS } from "./TabBar/tabs";
import { SidebarNavItem } from "./TabBar/SidebarNav";

const VALID_TABS = new Set(TABS.map((t) => t.id));

export default function ProfileLayout() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tabParam = searchParams.get("tab");
	const active = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";

	const setActive = useCallback(
		(id: string) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (id === "dashboard") next.delete("tab");
					else next.set("tab", id);
					return next;
				},
				{ replace: false },
			);
		},
		[setSearchParams],
	);

	const [hover, setHover] = useState("");

	const user = useAuthStore((s) => s.user)!;
	const now = new Date().getHours();
	const greeting = now > 5 && now < 12 ? "morning" : now < 17 ? "afternoon" : "evening";

	if (!user || !user.name) {
		return null;
	}

	const viewEvents = () => setActive("events");
	const viewBookings = () => setActive("bookings");

	// Override the display label for the payment tab without touching tabs.ts
	const tabs = TABS.map((tab) => (tab.id === "payment" ? { ...tab, label: "Plan Details" } : tab));

	return (
		<div className="container-fluid" style={{ overflow: "hidden", height: "100%", width: "100%" }}>
			<div className="row min-lg-vh-100">
				<aside className={`sidebar col-12 col-md-3 col-lg-2 border-end bg-body-tertiary px-0`}>
					<div className={`d-flex flex-column h-lg-100`}>
						<div className="p-3 border-bottom">
							<h6 className="mb-0">Hello {user.name.split(" ")[0]}</h6>
							<small className="text-muted">Good {greeting}</small>
						</div>

						<nav className="nav nav-pills flex-wrap flex-lg-column py-2">
							{tabs.map((tab, i) => (
								<Fragment key={tab.id}>
									<SidebarNavItem
										tab={tab}
										active={active}
										hover={hover}
										onSelect={setActive}
										onHover={setHover}
									/>
									{i === 0 && (
										<div
											className={`d-none d-lg-block rounded-lg ${hover === "settings" ? "bg-primary" : ""} overflow-hidden ms-3`}
											style={{
												width: "60%",
												height: "2px",
												backgroundColor: "transparent",
												color: "transparent",
											}}
										>
											as
										</div>
									)}
								</Fragment>
							))}
						</nav>
					</div>
				</aside>

				<main className="col-12 col-md-9 col-lg-10 p-3">
					<div className="card shadow-sm h-100">
						<div className="card-body">
							{active === "dashboard" && (
								<Dashboard viewEventsFn={viewEvents} viewBookingsFn={viewBookings} />
							)}
							{active === "personal" && <PersonalContent />}
							{active === "payment" && <PaymentContent />}
							{active === "bookings" && <Bookings />}
							{active === "events" && <Events />}
							{active === "history" && <BookingHistory />}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
