/**
 * Source unique de vérité des références cliniques citées par Respirfacile.
 *
 * RÈGLE ABSOLUE : aucun chiffre d'efficacité ne s'affiche dans l'application ou
 * sur le site public s'il n'est pas rattaché à une entrée de ce fichier.
 * Pas de témoignage inventé, pas de « nombre d'utilisateurs » arrondi à la
 * hausse, pas de note de satisfaction fabriquée. Un orthophoniste vérifie.
 *
 * Chaque entrée a été relue sur la source primaire (juillet 2026).
 */

export interface ClinicalStudy {
  /** Identifiant court utilisé comme clé React et ancre. */
  id: string;
  /** Citation courte affichée à l'écran. */
  shortRef: string;
  /** Citation complète, format académique. */
  fullRef: string;
  /** Type de preuve, affiché tel quel au praticien. */
  design: string;
  /** Ce que l'étude montre, formulé sans extrapolation. */
  finding: string;
  /** Limite explicite. Toujours affichée avec le résultat. */
  caveat: string;
  url: string;
}

export const CLINICAL_STUDIES: ClinicalStudy[] = [
  {
    id: "camacho-2015",
    shortRef: "Camacho et al., 2015",
    fullRef:
      "Camacho M, Certal V, Abdullatif J, et al. Myofunctional therapy to treat obstructive sleep apnea: a systematic review and meta-analysis. Sleep. 2015;38(5):669-675.",
    design: "Méta-analyse, 9 études adultes, 120 patients",
    finding:
      "Indice d'apnées-hypopnées moyen passé de 24,5 à 12,3 par heure après thérapie myofonctionnelle, soit une baisse d'environ 50 %. Score de somnolence d'Epworth passé de 14,8 à 8,2.",
    caveat:
      "Populations à SAOS léger à modéré, effectifs faibles, pas de groupe contrôle dans toutes les études incluses.",
    url: "https://pubmed.ncbi.nlm.nih.gov/25348130/",
  },
  {
    id: "guimaraes-2009",
    shortRef: "Guimarães et al., 2009",
    fullRef:
      "Guimarães KC, Drager LF, Genta PR, Marcondes BF, Lorenzi-Filho G. Effects of oropharyngeal exercises on patients with moderate obstructive sleep apnea syndrome. Am J Respir Crit Care Med. 2009;179(10):962-966.",
    design: "Essai randomisé contrôlé contre thérapie placebo, 31 patients",
    finding:
      "Trois mois d'exercices oropharyngés quotidiens réduisent significativement la sévérité du SAOS modéré, le ronflement et la somnolence diurne, comparés à une thérapie placebo.",
    caveat:
      "Protocole d'environ 30 minutes par jour pendant 3 mois. Petit effectif, un seul centre, SAOS modéré uniquement.",
    url: "https://pubmed.ncbi.nlm.nih.gov/19234106/",
  },
  {
    id: "cochrane-2020",
    shortRef: "Revue Cochrane, 2020",
    fullRef:
      "Rueda JR, Mugueta-Aguinaga I, Vilaró J, Rueda-Etxebarria M. Myofunctional therapy (oropharyngeal exercises) for obstructive sleep apnoea. Cochrane Database Syst Rev. 2020;11:CD013449.",
    design: "Revue systématique Cochrane, 9 études, 347 participants",
    finding:
      "La thérapie myofonctionnelle réduit probablement la somnolence diurne et peut réduire l'indice d'apnées-hypopnées par rapport à l'absence de traitement.",
    caveat:
      "Niveau de preuve modéré à très faible. Comparée à la pression positive continue, la thérapie myofonctionnelle fait moins bien : elle ne la remplace pas.",
    url: "https://pubmed.ncbi.nlm.nih.gov/33141943/",
  },
];

/**
 * Phrase de cadrage à afficher partout où un chiffre d'efficacité apparaît.
 * Reprend la contrainte médicale non négociable : jamais de promesse de guérison.
 */
export const EVIDENCE_DISCLAIMER =
  "Ces résultats viennent de la littérature scientifique sur la thérapie myofonctionnelle, pas de mesures faites dans Respirfacile. L'application est un outil d'accompagnement entre deux séances : elle ne pose pas de diagnostic, ne remplace ni un avis médical ni un traitement en cours (pression positive continue, orthèse d'avancée mandibulaire, chirurgie).";

/**
 * Ce que fait réellement l'application, par opposition à ce que montrent les
 * études. Sert à séparer clairement les deux plans dans le discours public.
 */
export const PRODUCT_PROMISE =
  "Ce que Respirfacile apporte, c'est la régularité : un programme prescrit par le praticien, guidé au quotidien, et des données que vous relisez ensemble à la séance suivante.";
