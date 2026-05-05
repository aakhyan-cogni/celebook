import PlanCard from "./PlanCard";

const SubscriptionPlans = () => {
  return (
    <div className="container-fluid h-100 d-flex flex-column personal-wrapper">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="d-flex align-items-center w-100 overflow-hidden">
          <div className="bg-info rounded-circle mx-2" style={{ width: 10, height: 10 }} />
          <h4 className="mt-1 text-info">Subscription & Plans</h4>
        </div>
        <hr className="my-2 border-info border-2 opacity-95" />
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
        <div className="row ">

          {/* Card */}
          <div className="col-12 col-lg-4">
            <PlanCard active={true} title="Pro" />
          </div>

          {/* Card Content */}
          <div className="col-12 col-lg-7 pb-5 pb-lg-0 flex-column flex-lg-row justify-content-center">
            <div className="m-2 p-2">
				<label className="form-label fw-bold fs-4"> Renewal Date </label><br />
				<label className="form-label fw-semibold fs-5 text-info" >{new Date(Date.now()+(5*24*60*60*1000)).toLocaleDateString()}</label>
            </div>
			<div className="alert alert-info" role="alert">
				🔥 You should <span className="fw-bold text-warning">upgrade</span> your plan to utilize more features
			</div>
			<button className="btn btn-danger col-5 me-2 ">Cancle Subscription</button>
			<button className="btn btn-info col-5 fw-semibold">🔥Upgrade</button>
          </div>
        </div>

      </div>
    </div>
  );
}
export default SubscriptionPlans;