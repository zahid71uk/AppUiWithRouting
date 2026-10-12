"use client";

export default function MarketAnalysisError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="route-error" role="alert">
      <p className="eyebrow">MARKET ANALYSIS / UNAVAILABLE</p>
      <h1>This sample could not be loaded.</h1>
      <p>Check that the analysis and model services are running, then retry.</p>
      <button className="button button-primary" onClick={() => reset()} type="button">Try again</button>
    </section>
  );
}