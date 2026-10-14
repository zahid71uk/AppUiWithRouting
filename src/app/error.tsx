"use client";

import { useEffect } from "react";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[property-desk] route-render-failure", { digest: error.digest, errorType: error.name });
  }, [error]);

  return (
    <section className="route-error" role="alert">
      <p className="eyebrow">A TEMPORARY INTERRUPTION</p>
      <h1>This view could not load.</h1>
      <button className="button button-primary" onClick={() => reset()} type="button">Try again</button>
    </section>
  );
}