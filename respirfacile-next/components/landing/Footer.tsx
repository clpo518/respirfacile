import { LogoIcon } from "@/components/ui/Logo"
import Link from "next/link"
import { contactEmail, legalEntity } from "@/lib/site"

export function Footer() {
  return (
    <footer className="bg-forest-900 text-beige-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LogoIcon size={28} />
              <span className="font-semibold text-white">Respirfacile</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Rééducation respiratoire guidée pour les troubles respiratoires du sommeil et la thérapie myofonctionnelle.
              Complément aux soins, prescrit par un praticien.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">L&apos;histoire</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Connexion</Link></li>
              <li><Link href="/auth?mode=signup" className="hover:text-white transition-colors">Inscription</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-forest-700 pt-8 space-y-3">
          <p className="text-xs leading-relaxed max-w-3xl">
            Respirfacile n&apos;est pas un dispositif médical. L&apos;application ne pose aucun diagnostic et ne remplace
            ni un avis médical ni un traitement en cours. En cas d&apos;urgence, appelez le 15.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} {legalEntity.name}, {legalEntity.address}
            </p>
            <a href={`mailto:${contactEmail}`} className="text-xs hover:text-white transition-colors">
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
