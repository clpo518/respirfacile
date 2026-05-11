import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Dumbbell, Settings } from "lucide-react"
import type { ReactNode } from "react"

// ─────────────────────────────────────────────
// AppLayout — layout adaptatif mobile/desktop
// Mobile  : bottom nav fixe
// Desktop : sidebar gauche fixe + contenu centré max-w-2xl
// ─────────────────────────────────────────────

interface AppLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/practice",  icon: Dumbbell,         label: "Exercices" },
  { href: "/settings",  icon: Settings,          label: "Profil" },
]

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-organic flex">

      {/* ── Sidebar desktop (lg+) ─────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 bg-card border-r border-border z-40">

        {/* Logo / Brand */}
        <div className="px-5 pt-8 pb-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🫁</div>
            <span className="font-display text-base text-foreground">RespirFacile</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                to={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="px-5 pb-6">
          <p className="text-[10px] text-muted-foreground/50">RespirFacile · v1.0</p>
        </div>
      </aside>

      {/* ── Zone contenu ─────────────────────── */}
      <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Conteneur centré avec max-width */}
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* ── Bottom nav mobile (< lg) ──────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex items-center justify-around safe-area-bottom z-40">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-col items-center gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
