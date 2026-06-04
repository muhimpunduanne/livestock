"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStockStore } from "@/lib/store/useStockStore";

const LINKS = [
  { href: "/screener", label: "Screener" },
  { href: "/analytics", label: "Analytics" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, lastUpdated } = useStockStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-8">
      <Link href="/" className="text-emerald-400 font-bold text-lg tracking-tight">
        LiveStock
      </Link>

      <div className="flex gap-1">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(href)
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3 text-xs">
        <span
          className={`flex items-center gap-1.5 ${
            isConnected ? "text-emerald-400" : "text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            }`}
          />
          {isConnected ? "Live" : "Disconnected"}
        </span>
        {lastUpdated && (
          <span className="text-gray-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </nav>
  );
}
