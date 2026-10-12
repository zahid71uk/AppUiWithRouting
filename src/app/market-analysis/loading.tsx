export default function MarketAnalysisLoading() {
  return (
    <div className="page-wrap" aria-live="polite" aria-busy="true">
      <div className="loading-title" />
      <div className="market-loading-metrics"><div /><div /><div /><div /></div>
      <div className="market-loading-charts"><div /><div /></div>
      <span className="sr-only">Loading sample market analysis</span>
    </div>
  );
}