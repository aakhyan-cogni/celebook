import type { TabConfig } from "./tabs";

interface SidebarNavItemProps {
	tab: TabConfig;
	active: string;
	hover: string;
	onSelect: (id: string) => void;
	onHover: (id: string) => void;
}

export function SidebarNavItem({ tab, active, hover, onSelect, onHover }: SidebarNavItemProps) {
	const isActive = active === tab.id;
	const isHovered = hover === tab.id;
	const ariaCurrent = tab.id === "dashboard" && isActive ? "page" : undefined;

	return (
		<>
			<div className="nav-item d-flex">
				<button
					className={tab.buttonClass}
					onClick={() => onSelect(tab.id)}
					aria-current={ariaCurrent}
					onMouseOver={() => onHover(tab.id)}
					onMouseOut={() => onHover("")}
				>
					<span className="me-2">{tab.icon}</span>
					{tab.label}
				</button>
				<div
					className={`rouded-3 rounded-top rounded-bottom ${isActive ? "bg-primary" : ""} my-2`}
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
				className={`d-none d-lg-block ${isHovered ? "bg-primary" : ""} overflow-hidden ms-3${tab.id === "dashboard" ? " rouded-2 rounded-start rounded-end" : ""}`}
				style={{
					width: tab.hoverWidth,
					height: "2px",
					backgroundColor: "transparent",
					color: "transparent",
				}}
			>
				as
			</div>
		</>
	);
}
