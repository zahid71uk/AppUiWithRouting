export default function Loading() {
  return (
    <div className="page-wrap" aria-live="polite" aria-busy="true">
      <div className="loading-title" />
      <div className="loading-grid"><div /><div /></div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}