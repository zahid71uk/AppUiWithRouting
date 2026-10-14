"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[property-desk] global-render-failure", { digest: error.digest, errorType: error.name });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="route-error" role="alert">
          <p className="eyebrow">PARCEL / ERROR</p>
          <h1>Something went wrong.</h1>
          <button className="button button-primary" onClick={() => reset()} type="button">Try again</button>
        </main>
      </body>
    </html>
  );
}