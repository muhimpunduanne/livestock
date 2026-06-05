"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStockStore } from "@/lib/store/useStockStore";

const LINKS = [
  { href: "/screener", label: "Screener" },
  { href: "/analytics", label: "Analytics" },
  { href: "/dashboard", label: "Dashboard" },
];

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="10" width="3.5" height="7" rx="1" fill="#10b981" />
      <rect x="7.25" y="6" width="3.5" height="11" rx="1" fill="#10b981" opacity="0.7" />
      <rect x="13.5" y="2" width="3.5" height="15" rx="1" fill="#10b981" opacity="0.4" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, lastUpdated } = useStockStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900/90 backdrop-blur-md border-b border-gray-800/80 flex items-center px-6 gap-8">
      <Link href="/" className="flex items-center gap-2 text-emerald-400 font-bold text-lg tracking-tight shrink-0">
        <LogoIcon />
        LiveStock
      </Link>

      <div className="flex items-center gap-1">
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                active
                  ? "text-emerald-300"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
              }`}
            >
              {label}
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-4 text-xs">
        {lastUpdated && (
          <span className="text-gray-600 hidden sm:block">
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        <span
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            }`}
          />
          {isConnected ? "Live" : "Offline"}
        </span>
      </div>
    </nav>
  );
}
