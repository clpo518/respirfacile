import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth/AuthForm"
import Link from "next/link"
import { LogoWordmark } from "@/components/ui/Logo"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Respirfacile",
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-beige-100 flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-[#2D5016]/5 blur-3xl" />
        <div className="absolute -bottom-20 left-0 w-60 h-60 rounded-full bg-[#8B4513]/5 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 relative z-10">
        <LogoWordmark iconSize={32} />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-beige-100 rounded-3xl border border-beige-300 p-10 animate-pulse">
              <div className="h-8 bg-beige-300 rounded-xl mb-4 w-3/4" />
              <div className="h-4 bg-beige-300 rounded mb-8 w-1/2" />
              <div className="space-y-4">
                <div className="h-12 bg-beige-300 rounded-xl" />
                <div className="h-12 bg-beige-300 rounded-xl" />
                <div className="h-12 bg-beige-300 rounded-xl" />
              </div>
            </div>
          }>
            <AuthForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center text-sm text-forest-400 relative z-10">
        © {new Date().getFullYear()} Respirfacile ·{" "}
        <Link href="/mentions-legales" className="hover:text-forest-600 transition-colors">
          Mentions légales
        </Link>
      </footer>
    </div>
  )
}
