"use client";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="route-error" role="alert">
      <p className="eyebrow">A TEMPORARY INTERRUPTION</p>
      <h1>This view could not load.</h1>
      <button className="button button-primary" onClick={() => reset()} type="button">Try again</button>
    </section>
  );
}