import { HistoryTable } from "@/components/history-table";

export default function HistoryPage() {
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PROPERTY DESK <span className="eyebrow-slash">/</span> 02</p>
          <h1>Estimate history</h1>
        </div>
        <span className="page-index">02 <span>/</span> 03</span>
      </div>
      <section className="history-panel" aria-label="Saved property estimates">
        <HistoryTable />
      </section>
    </div>
  );
}