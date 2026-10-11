import { EstimateResults } from "@/components/estimate-results";
import { PropertyForm } from "@/components/property-form";

export default function EstimatePage() {
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PROPERTY DESK <span className="eyebrow-slash">/</span> 01</p>
          <h1>New estimate</h1>
        </div>
        <span className="page-index">01 <span>/</span> 03</span>
      </div>
      <div className="estimate-grid grid grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]">
        <PropertyForm />
        <EstimateResults />
      </div>
    </div>
  );
}