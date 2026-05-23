import React, { useState } from "react";
import BasicProfileInfo from "./BasicProfileInfo";
import Address from "./Address";
import OrganizationalInfo from "./OrganizationalInfo";
export default function PersonalContent() {
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
