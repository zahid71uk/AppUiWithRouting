export default function DataManagementLoading() {
  return (
    <div className="page-wrap" aria-live="polite" aria-busy="true">
      <div className="loading-title" />
      <div className="model-data-loading" />
      <div className="model-data-loading model-data-loading-table" />
      <span className="sr-only">Loading dataset and model status</span>
    </div>
  );
}