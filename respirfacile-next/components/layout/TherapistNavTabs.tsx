'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/therapist", label: "📊 Tableau de bord", exact: true },
  { href: "/therapist/invite", label: "👥 Ajouter un patient", exact: false },
];

const TABS_MOBILE_EXTRA = [
  { href: "/pricing", label: "💳 Abonnement", exact: false },
];

export function TherapistNavTabs() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 border-t border-beige-300 pt-3">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`text-sm font-medium px-3 pb-2 border-b-2 transition-colors ${
            isActive(tab.href, tab.exact)
              ? "text-forest-900 border-forest-700 font-semibold"
              : "text-forest-600 border-transparent hover:text-forest-900 hover:border-forest-400"
          }`}
        >
          {tab.label}
        </Link>
      ))}
      {TABS_MOBILE_EXTRA.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`text-sm font-medium px-3 pb-2 border-b-2 transition-colors md:hidden ${
            isActive(tab.href, tab.exact)
              ? "text-forest-900 border-forest-700 font-semibold"
              : "text-forest-600 border-transparent hover:text-forest-900 hover:border-forest-400"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
