export default function AuthBackground() {
	return (
		<>
			<div
				className="position-absolute top-0 start-0 translate-middle bg-primary opacity-10 rounded-circle"
				style={{ width: "600px", height: "600px", filter: "blur(100px)", zIndex: 0 }}
			></div>
			<div
				className="position-absolute bottom-0 end-0 bg-info opacity-10 rounded-circle"
				style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: 0 }}
			></div>
		</>
	);
}
