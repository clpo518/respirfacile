import { useState, useRef, useEffect } from "react"
import { Share2, MessageCircle, Mail, Copy, CheckCheck, ChevronDown } from "lucide-react"
import { toast } from "sonner"

function buildMessage(): string {
  const url = typeof window !== "undefined" ? window.location.origin : "https://respirfacile.fr"
  return `Je te recommande respirfacile — une application de suivi patient pour la rééducation respiratoire (SAOS, TMOF). Tes patients font leurs exercices à la maison, tu suis l'observance en temps réel. 30 jours d'essai gratuit, sans carte bancaire. ${url}`
}

export function RecommendButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const msg = buildMessage()

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
    setOpen(false)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent("Application respirfacile — pour tes patients")
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(msg)}`, "_blank")
    setOpen(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true)
      toast.success("Message copié")
      setTimeout(() => setCopied(false), 2000)
    })
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary transition-colors text-sm font-medium"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Recommander à un collègue</span>
        <span className="sm:hidden">Recommander</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-52 bg-card border border-border rounded-xl shadow-soft z-20 overflow-hidden">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors text-sm text-foreground"
          >
            <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors text-sm text-foreground border-t border-border/50"
          >
            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
            Email
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors text-sm text-foreground border-t border-border/50"
          >
            {copied
              ? <CheckCheck className="w-4 h-4 text-primary shrink-0" />
              : <Copy className="w-4 h-4 text-muted-foreground shrink-0" />}
            {copied ? "Copié !" : "Copier le message"}
          </button>
        </div>
      )}
    </div>
  )
}
