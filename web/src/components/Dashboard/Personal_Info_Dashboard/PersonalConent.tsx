import React, {useState} from "react";
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
