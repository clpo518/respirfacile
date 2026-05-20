import { Link, useLocation } from "react-router-dom"
import { Activity, LayoutDashboard, Dumbbell, Settings, Users, ExternalLink, History } from "lucide-react"
import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const { isTherapist } = useAuth()

  const navItems = isTherapist
    ? [
        { href: "/patients", icon: Users,          label: "Patients" },
        { href: "/settings", icon: Settings,        label: "Profil" },
      ]
    : [
        { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
        { href: "/practice",  icon: Dumbbell,         label: "Exercices" },
        { href: "/history",   icon: History,           label: "Historique" },
        { href: "/settings",  icon: Settings,          label: "Profil" },
      ]

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && href !== "/patients" && pathname.startsWith(href))
    || pathname === href

  return (
    <div className="min-h-screen bg-organic flex">

      {/* ── Sidebar desktop (lg+) ─────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-card border-r border-border z-40">

        {/* Logo */}
        <div className="px-6 pt-8 pb-8 border-b border-border/50">
          <Link
            to={isTherapist ? "/patients" : "/dashboard"}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground leading-tight">RespirFacile</p>
              <p className="text-[10px] text-muted-foreground">{isTherapist ? "Espace praticien" : "Espace patient"}</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                to={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Site public
          </Link>
          <p className="text-[10px] text-muted-foreground/40">v0.1.0 · Fait avec 🌿 en France</p>
        </div>
      </aside>

      {/* ── Zone contenu ─────────────────────── */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        <div className="w-full max-w-4xl mx-auto min-h-screen">
          {children}
        </div>
      </main>

      {/* ── Bottom nav mobile (< lg) ──────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex items-center justify-around z-40">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
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
