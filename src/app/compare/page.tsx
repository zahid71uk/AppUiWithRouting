import { ComparisonView } from "@/components/comparison-view";

export default function ComparePage() {
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PROPERTY DESK <span className="eyebrow-slash">/</span> 03</p>
          <h1>Compare estimates</h1>
        </div>
        <span className="page-index">03 <span>/</span> 03</span>
      </div>
      <ComparisonView />
    </div>
  );
}