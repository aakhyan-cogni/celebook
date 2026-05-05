export default function Footer() {
	return (
		<footer className="p-2 w-100 d-flex align-items-center justify-content-center bg-secondary-subtle z-2">
			&copy; {new Date().getFullYear()} EMS. All rights reserved.
		</footer>
	);
}
