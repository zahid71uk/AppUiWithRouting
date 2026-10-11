import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Clock3 } from "lucide-react";

import { BrandMark, Navigation } from "@/components/navigation";
import { EstimatesProvider } from "@/hooks/use-estimates";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-ui" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Parcel | Property estimates",
  description: "Property price estimates and comparisons.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable}`}>
        <EstimatesProvider>
          <div className="app-shell">
            <header className="topbar">
              <BrandMark />
              <Navigation />
              <div className="topbar-meta"><Clock3 size={14} aria-hidden="true" /> BROWSER HISTORY</div>
            </header>
            <main id="main-content" className="main-content">{children}</main>
            <footer className="site-footer">
              <span>PARCEL <span className="brand-period">/</span> PROPERTY ESTIMATES</span>
              <span>Predictions are estimates, not valuations.</span>
            </footer>
          </div>
        </EstimatesProvider>
      </body>
    </html>
  );
}