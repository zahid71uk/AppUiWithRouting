"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, Clock3, Database, House, Layers3 } from "lucide-react";

const items = [
  { href: "/", label: "Estimate", icon: House },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/compare", label: "Compare", icon: Layers3 },
  { href: "/market-analysis", label: "Market analysis", icon: ChartNoAxesCombined },
  { href: "/data-management", label: "Data", icon: Database },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="nav-tabs">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/market-analysis" || href === "/data-management"
          ? pathname.startsWith(href)
          : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            prefetch={href === "/market-analysis" ? false : undefined}
            aria-current={active ? "page" : undefined}
            className={`nav-link${active ? " nav-link-active" : ""}`}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  return (
    <Link className="brand" href="/" aria-label="Parcel, estimate dashboard">
      <span className="brand-icon"><ChartNoAxesCombined size={19} aria-hidden="true" /></span>
      <span>parcel<span className="brand-period">.</span></span>
    </Link>
  );
}