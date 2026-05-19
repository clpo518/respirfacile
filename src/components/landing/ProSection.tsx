export function ProSection() {
  return (
    <section className="relative w-full bg-forest-dark text-white py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Pour les orthophonistes et kinésithérapeutes
            </h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Respirfacile est basée sur 9 études cliniques — avec la méta-analyse Stanford 2015, n=120 participants. Une approche scientifiquement validée pour la rééducation myofonctionnelle.
            </p>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <span className="text-forest-muted font-bold">✓</span>
                <span>Suivi d'observance en temps réel</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-forest-muted font-bold">✓</span>
                <span>Bilan PDF exportable pour le médecin du sommeil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-forest-muted font-bold">✓</span>
                <span>30 exercices validés cliniquement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-forest-muted font-bold">✓</span>
                <span>Essai 30 jours gratuit, sans carte bancaire</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-forest-muted font-bold">✓</span>
                <span>Patients accèdent gratuitement via votre code</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 text-foreground">
            <div className="space-y-6">
              <div className="border-l-4 border-forest pl-4">
                <p className="text-sm font-semibold text-forest uppercase tracking-wider">
                  Validé scientifiquement
                </p>
                <p className="text-2xl font-display font-bold text-foreground mt-2">
                  -50% IAH en moyenne
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Méta-analyse Camacho et al. 2015
                </p>
              </div>
              <div className="border-l-4 border-forest-light pl-4">
                <p className="text-sm font-semibold text-forest-light uppercase tracking-wider">
                  Facile d'utilisation
                </p>
                <p className="text-2xl font-display font-bold text-foreground mt-2">
                  2 min pour prescrire
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Code généré automatiquement
                </p>
              </div>
              <div className="border-l-4 border-forest-muted pl-4">
                <p className="text-sm font-semibold text-forest-muted uppercase tracking-wider">
                  Conformité
                </p>
                <p className="text-2xl font-display font-bold text-foreground mt-2">
                  RGPD · Hébergement France
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Données médicales protégées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
