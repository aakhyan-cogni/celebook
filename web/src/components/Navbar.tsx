import { Link, NavLink, useNavigate } from "react-router";
import ThemeSwitch from "./ThemeSwitch";
import { Avatar } from "./Avatar";
import { Bell } from "lucide-react";
import { Popover, OverlayTrigger } from "react-bootstrap";
import EMS_LOGO_LIGHT from "../assets/EMS_LOGO_LIGHT.png";
import EMS_LOGO_DARK from "../assets/EMS_LOGO_DARK.png";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { logout } from "../api/auth.api";

export default function Navbar() {
	const user = useAuthStore((s) => s.user);
	const localLogout = useAuthStore((s) => s.logout);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const navigate = useNavigate();
	const [isDark, setIsDark] = useState(() => {
		return localStorage.getItem("theme") === "dark";
	});

	return (
		<nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body-tertiary flex-nowrap">
			<div className="container gap-md-2">
				<Link className="navbar-brand fw-bold text-primary m-0 mx-md-5" to="/">
					<img
						src={isDark ? EMS_LOGO_DARK : EMS_LOGO_LIGHT}
						alt="CeleBook Logo"
						style={{ width: "50px", height: "50px" }}
					/>
				</Link>

				<button
					className="navbar-toggler shadow-none border-0"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#emsNav"
					aria-controls="emsNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="emsNav">
					<ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3 text-center">
						<li className="nav-item">
							<NavLink className="nav-link" to="/events">
								Explore Events
							</NavLink>
						</li>
						{isAuthenticated && (
							<li className="nav-item">
								<NavLink className="nav-link" to="/dashboard">
									Dashboard
								</NavLink>
							</li>
						)}
						{!isAuthenticated && (
							<li className="nav-item">
								<NavLink className="nav-link" to="/pricing">
									Pricing
								</NavLink>
							</li>
						)}
						<li className="nav-item">
							<NavLink className="nav-link" to="/support">
								Support
							</NavLink>
						</li>
					</ul>
				</div>
			</div>
			<div className="d-flex align-items-center gap-3 me-5">
				<ThemeSwitch isDark={isDark} setIsDark={setIsDark} />
				{isAuthenticated ? (
					<div className="d-flex align-items-center gap-2">
						<Link to="/notifications">
							<Bell size={24} />
						</Link>
						<div style={{ width: "2rem", cursor: "pointer" }}>
							<OverlayTrigger
								trigger="click"
								placement="bottom"
								rootClose
								overlay={
									<Popover id="user-popover" className="shadow border-0">
										<Popover.Header as="h3" className="text-white border-0">
											Hi, {user!.name.split(" ")[0]}!
										</Popover.Header>
										<Popover.Body className="p-0">
											<div className="list-group list-group-flush">
												<Link
													to="/dashboard"
													className="list-group-item list-group-item-action border-0"
												>
													My Dashboard
												</Link>
												<button
													onClick={() => {
														logout().then(localLogout);
														navigate("/");
													}}
													className="list-group-item list-group-item-action text-danger border-0"
												>
													Logout
												</button>
											</div>
										</Popover.Body>
									</Popover>
								}
							>
								<div>
									<Avatar user={user!} />
								</div>
							</OverlayTrigger>
						</div>
					</div>
				) : (
					<Link to="/login" className="btn btn-primary rounded-pill px-4 w-100 w-lg-auto shadow-sm">
						Login
					</Link>
				)}
			</div>
		</nav>
	);
}
