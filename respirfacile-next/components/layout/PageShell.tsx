import { LogoIcon } from "@/components/ui/Logo"
import Link from "next/link";
import { type Exercise } from "@/lib/data/exercises";

interface PageShellProps {
  exercise: Exercise;
  children: React.ReactNode;
}

export function PageShell({ exercise, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture flex flex-col">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <LogoIcon size={28} />
            <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
          </Link>
          <Link href="/exercises" className="text-sm text-forest-500 hover:text-forest-700 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Mes exercices
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {children}
      </main>
    </div>
  );
}
