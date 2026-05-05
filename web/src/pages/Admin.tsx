import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import Overview from "../components/admin/Overview";
import Events from "../components/admin/Events";
import Users from "../components/admin/Users";

const Admin = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const user = useAuthStore((s) => s.user)!;

	useEffect(() => {
		if (!isAuthenticated || !user || !user.name) {
			navigate("/login");
			return;
		}
		if (user.role && user.role !== "ADMIN") navigate("/dashboard");
	}, [user, isAuthenticated]);

	const [active, setActive] = useState("overview");
	const [hover, setHover] = useState("");

	if (!user || !user.name) {
		return null;
	}

	const viewEvents = () => {
		setActive("events");
	};

	const viewUsers = () => {
		setActive("users");
	};

	const now = new Date().getHours();
	const greeting = now > 5 && now < 12 ? "morning" : now < 17 ? "afternoon" : "evening";

	return (
		<div className="container-fluid" style={{ overflow: "hidden", height: "100%", width: "100%" }}>
			<div className="row min-lg-vh-100">
				<aside className={`sidebar col-12 col-md-3 col-lg-2 border-end bg-body-tertiary px-0 `}>
					<div className={`d-flex flex-column h-lg-100`}>
						<div className="p-3 border-bottom">
							<h6 className="mb-0">Hello {user.name.split(" ")[0]}</h6>
							<small className="text-muted">Good {greeting}</small>
						</div>

						<nav className="nav nav-pills flex-wrap flex-lg-column py-2">
							<div className="nav-item d-flex">
								{/* <NavButton id="overview" label="overview" icon={"🗓️"}/> */}
								<button
									className={`btn outline-none decoration m-1 mb-0 ms-2 text-start px-3 pt-2 border-none `}
									onClick={() => setActive("overview")}
									aria-current={active === "overview" ? "page" : undefined}
									onMouseOver={() => setHover("overview")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"👀"}</span>
									{"Overview"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "overview" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`  d-none d-lg-block rouded-2 rounded-start rounded-end ${hover === "overview" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "70%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="events" label="events Details" icon={"💰"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("events")}
									onMouseOver={() => setHover("events")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"📢"}</span>
									{"Events"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "events" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`d-none d-lg-block ${hover === "events" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "65%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="users" label="users Details" icon={"👤"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("users")}
									onMouseOver={() => setHover("users")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"👥"}</span>
									{"Users"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "users" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`d-none d-lg-block ${hover === "users" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "65%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
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
						</nav>
					</div>
				</aside>

				<main className="col-12 col-md-9 col-lg-10 p-3">
					<div className="card shadow-sm h-100">
						<div className="card-body">
							{active === "overview" && <Overview viewEventsFn={viewEvents} viewUsersFn={viewUsers} />}
							{active === "users" && <Users />}
							{active === "events" && <Events />}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default Admin;
