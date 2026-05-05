import { useEffect } from "react";

export default function ThemeSwitch({ isDark, setIsDark }: ThemeSwitchProps) {
	useEffect(() => {
		const theme = isDark ? "dark" : "light";
		document.documentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
	}, [isDark]);

	return (
		<div className="form-check form-switch mb-0">
			<input
				className="form-check-input"
				type="checkbox"
				role="switch"
				id="themeSwitch"
				checked={isDark}
				onChange={() => setIsDark(!isDark)}
				style={{ cursor: "pointer" }}
			/>
			<label
				className={`form-check-label small d-none d-xl-inline ${isDark ? "text-info" : "text-muted"}`}
				htmlFor="themeSwitch"
				style={{ cursor: "pointer", marginLeft: "5px" }}
			>
				{isDark ? "🌙" : "☀️"}
			</label>
		</div>
	);
}

interface ThemeSwitchProps {
	isDark: boolean;
	setIsDark: React.Dispatch<React.SetStateAction<boolean>>
}