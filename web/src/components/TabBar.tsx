import React, { useState } from "react";
import BasicProfileInfo from "./Dashboard/Personal_Info_Dashboard/BasicProfileInfo";
import Address from "./Dashboard/Personal_Info_Dashboard/Address";
import OrganizationalInfo from "./Dashboard/Personal_Info_Dashboard/OrganizationalInfo";
import SavedPaymentMethods from "./Dashboard/Payment_Info_Dashboard/SavedPaymentMethods";
import TransactionHistory from "./Dashboard/Payment_Info_Dashboard/TransactionHistory";
import SubscriptionPlans from "./Dashboard/Payment_Info_Dashboard/SubscriptionPlans";
import Dashboard from "./Dashboard/Dashboard";
import { useAuthStore } from "../store/useAuthStore";

export default function ProfileLayout() {
	const [active, setActive] = useState("dashboard");
	const [hover, setHover] = useState("");

	const user = useAuthStore((s) => s.user)!;
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
								{/* <NavButton id="dashboard" label="Dashboard" icon={"🗓️"}/> */}
								<button
									className={`btn outline-none decoration m-1 mb-0 ms-2 text-start px-3 pt-2 border-none `}
									onClick={() => setActive("dashboard")}
									aria-current={active === "dashboard" ? "page" : undefined}
									onMouseOver={() => setHover("dashboard")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"🗓️"}</span>
									{"Dashboard"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "dashboard" ? "bg-primary" : ""} my-2`}
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
								className={`  d-none d-lg-block rouded-2 rounded-start rounded-end ${hover === "dashboard" ? "bg-primary" : ""} overflow-hidden ms-3`}
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
								{/* <NavButton id="personal" label="Personal Details" icon={"👤"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("personal")}
									onMouseOver={() => setHover("personal")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"👤"}</span>
									{"Personal Details"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "personal" ? "bg-primary" : ""} my-2`}
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
								className={`d-none d-lg-block ${hover === "personal" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "80%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="payment" label="Payment Details" icon={"💰"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("payment")}
									onMouseOver={() => setHover("payment")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"💰"}</span>
									{"Payment Details"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "payment" ? "bg-primary" : ""} my-2`}
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
								className={`d-none d-lg-block ${hover === "payment" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "80%",
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
							{active === "dashboard" && <Dashboard />}
							{active === "personal" && <PersonalContent />}
							{active === "payment" && <PaymentContent />}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

// export function PersonalContent() {

// 	// let i=0;
// 	const contents=[<BasicProfileInfo/>,<Address/>,<OrganizationalInfo/>];
// 	const [i,setI]=useState(0);
// 	const [content,setContent]=useState(contents[i]);

// 	function handleSave()
// 	{
// 			if(content===contents[0])
// 				setContent(contents[1]);
// 			else if(content===contents[1])
// 				setContent(contents[2]);
// 			else
// 				setContent(contents[0]);
// 	}

// 	function handlePrevious() {
// 		if(content===contents[1])
// 			setContent(contents[0]);
// 		else if(content===contents[2])
// 			setContent(contents[1]);
// 		else
// 			setContent(contents[0]);
// 	}

//   return (
//     <div className="container-fluid h-100 d-flex flex-column personal-wrapper">
// 		{content}

//         <div className="row ">
// 			<div className={`col-12 d-flex  align-items-between justify-content-between `}>
// 				<button onClick={handlePrevious} disabled={content===contents[0]} className={` float-start w-25 text-dark border-none form-control rounded-2 ${(content==contents[0])?"bg-secondary":"bg-primary"}`} >Previous</button>
// 				<button onClick={()=> setI(i+1)} className={` float-end bg-info w-25 text-dark border-none form-control rounded-2`} >Save & Next</button>
// 			</div>
//         </div>
//     </div>

//   )
// }

export function PersonalContent() {
	const saveHandlerRef = React.useRef<(() => void) | null>(null);

	const contents = [
		<BasicProfileInfo registerSave={(fn: (() => void) | null) => (saveHandlerRef.current = fn)} />,
		<Address registerSave={(fn: (() => void) | null) => (saveHandlerRef.current = fn)} />,
		<OrganizationalInfo registerSave={(fn: (() => void) | null) => (saveHandlerRef.current = fn)} />,
	];

	const [step, setStep] = useState(0);

	const content = contents[step];

	function handleSaveNext() {
		saveHandlerRef.current?.();
		setStep((prev) => (prev + 1) % contents.length);
	}

	function handlePrevious() {
		setStep((prev) => Math.max(prev - 1, 0));
	}

	const isFirst = step === 0;
	const isLast = step === contents.length - 1;

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{content}

			<div className="row">
				<div className="col-12 d-flex align-items-between justify-content-between">
					<button
						onClick={handlePrevious}
						disabled={isFirst}
						className={`float-start w-25 text-dark border-none form-control rounded-2 ${
							isFirst ? "bg-secondary" : "bg-info"
						}`}
					>
						Previous
					</button>

					<button
						onClick={handleSaveNext}
						className="float-end bg-info w-25 text-dark border-none form-control rounded-2"
					>
						{isLast ? "Save & Finish" : "Save & Next"}
					</button>
				</div>
			</div>
		</div>
	);
}

function PaymentContent() {
	const [step, setStep] = useState(0);

	const contents = [<SavedPaymentMethods />, <TransactionHistory />, <SubscriptionPlans />];

	const content = contents[step];

	function handleSaveNext() {
		setStep((prev) => (prev + 1) % contents.length);
	}

	function handlePrevious() {
		setStep((prev) => Math.max(prev - 1, 0));
	}

	const isFirst = step === 0;
	const isLast = step === contents.length - 1;

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{content}

			<div className="row">
				<div className="col-12 d-flex align-items-between justify-content-between">
					<button
						onClick={handlePrevious}
						disabled={isFirst}
						className={`float-start w-25 text-dark border-none form-control rounded-2 ${
							isFirst ? "bg-secondary" : "bg-info"
						}`}
					>
						Previous
					</button>

					<button
						onClick={handleSaveNext}
						disabled={isLast}
						className={` ${isLast ? "bg-secondary" : "bg-info"} float-end  w-25 text-dark border-none form-control rounded-2`}
					>
						{"Next"}
					</button>
				</div>
			</div>
		</div>
	);
}
