"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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