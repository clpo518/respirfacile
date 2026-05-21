"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/exercises", label: "Exercices", icon: "🏋️" },
  { href: "/journal", label: "Journal", icon: "📓" },
  { href: "/ressources", label: "Ressources", icon: "📚" },
  { href: "/history", label: "Historique", icon: "📊" },
];

export function MobileBottomNavClient() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-beige-300 flex md:hidden z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`flex-1 flex flex-col items-center py-3 transition-colors ${
              isActive
                ? "text-forest-600 border-t-2 border-forest-600"
                : "text-forest-400 hover:text-forest-600"
            }`}
          >
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
