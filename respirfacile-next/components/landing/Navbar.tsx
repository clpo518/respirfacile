"use client"
import Link from "next/link"
import { useState } from "react"
import { LogoWordmark } from "@/components/ui/Logo"

export function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-beige-200/95 backdrop-blur-md border-b border-beige-300/80">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <LogoWordmark iconSize={32} />

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-forest-600">
          <Link href="/#methode" className="hover:text-forest-700 transition-colors">Méthode</Link>
          <Link href="/#fonctionnalites" className="hover:text-forest-700 transition-colors">Fonctionnalités</Link>
          <Link href="/#temoignages" className="hover:text-forest-700 transition-colors">Témoignages</Link>
          <Link href="/pricing" className="hover:text-forest-700 transition-colors">Tarifs</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth" className="text-sm text-forest-600 hover:text-forest-700 transition-colors font-medium">Connexion</Link>
          <Link href="/auth?mode=signup&role=therapist" className="bg-forest-700 text-white text-sm px-5 py-2 rounded-full font-semibold hover:bg-forest-800 transition-colors shadow-sm">
            Essai gratuit →
          </Link>
        </div>

        <button className="md:hidden p-1" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-beige-100 border-t border-beige-300 px-4 py-5 space-y-1">
          <Link href="/#methode" className="block text-forest-700 font-medium py-2.5 hover:text-forest-700" onClick={() => setOpen(false)}>Méthode</Link>
          <Link href="/#fonctionnalites" className="block text-forest-700 font-medium py-2.5 hover:text-forest-700" onClick={() => setOpen(false)}>Fonctionnalités</Link>
          <Link href="/#temoignages" className="block text-forest-700 font-medium py-2.5 hover:text-forest-700" onClick={() => setOpen(false)}>Témoignages</Link>
          <Link href="/pricing" className="block text-forest-700 font-medium py-2.5 hover:text-forest-700" onClick={() => setOpen(false)}>Tarifs</Link>
          <div className="pt-3 border-t border-beige-300 space-y-2">
            <Link href="/auth" className="block text-forest-700 py-2.5 font-medium" onClick={() => setOpen(false)}>Connexion</Link>
            <Link href="/auth?mode=signup&role=therapist" className="block bg-forest-700 text-white px-4 py-3 rounded-2xl text-center font-semibold shadow-sm" onClick={() => setOpen(false)}>
              Essai gratuit 30 jours →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
