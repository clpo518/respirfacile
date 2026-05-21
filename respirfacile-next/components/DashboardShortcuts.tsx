import Link from 'next/link';

export function DashboardShortcuts() {
  const shortcuts = [
    { href: "/exercises", emoji: "🏋️", label: "Mes exercices", desc: "Lancer une séance" },
    { href: "/history", emoji: "📊", label: "Progression", desc: "Voir mes courbes" },
    { href: "/journal", emoji: "📓", label: "Journal", desc: "Saisir mon ressenti" },
    { href: "/ressources", emoji: "📚", label: "Ressources", desc: "Articles et conseils" },
  ];

  return (
    <div>
      <h2 className="font-semibold text-lg text-forest-800 mb-4">🔗 Accès rapide</h2>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-beige-100 border border-beige-300 rounded-2xl p-4 hover:border-forest-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <p className="text-2xl mb-2">{s.emoji}</p>
            <p className="font-semibold text-forest-800 text-sm group-hover:text-forest-600 transition-colors">{s.label}</p>
            <p className="text-xs text-forest-400 mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
