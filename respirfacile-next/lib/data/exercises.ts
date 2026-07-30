export type ExerciseCategory =
  | "pause_controlee"
  | "coherence_cardiaque"
  | "respiration_nasale"
  | "myofonctionnel"
  | "diaphragmatique"
  | "relaxation";

export type PatientProfileType =
  | "adult_saos_mild"
  | "adult_saos_severe"
  | "adult_tmof"
  | "adult_mixed";

export type MetricKey =
  | "pause_steps"
  | "pause_score"
  | "pause_duration"
  | "comfort_level"
  | "cycles_completed"
  | "regularity_score"
  | "hold_duration"
  | "duration_nasal_only"
  | "reps_completed"
  | "breath_rate";

export interface Exercise {
  id: string;
  category: ExerciseCategory;
  name_fr: string;
  description_fr: string;
  clinical_rationale_fr: string;
  expected_benefits_fr: string[];
  progression_fr: string;
  therapist_note_fr: string;
  duration_seconds: number;
  sets?: number;
  difficulty: 1 | 2 | 3;
  contraindications?: PatientProfileType[];
  instructions_fr: string[];
  tips_fr?: string[];
  metrics_tracked: MetricKey[];
  target_profile: PatientProfileType[];
  emoji: string;
  color: string;
  requiresInput?: boolean;
  inputLabel?: string;
  inputUnit?: string;
}

export const EXERCISES: Exercise[] = [

  // ═══════════════════════════════
  //  PAUSE CONTROLÉE
  // ═══════════════════════════════

  {
    id: "pause_controlee_decouverte",
    category: "pause_controlee",
    name_fr: "Mon premier score de pause",
    description_fr: "Votre point de départ. Marchez en retenant le souffle et comptez vos pas, ce chiffre mesure votre tolérance au CO2. Pas de bonne ou mauvaise réponse : c'est juste votre niveau d'aujourd'hui.",
    clinical_rationale_fr: "La Pause Contrôlée mesure la tolérance au dioxyde de carbone, marqueur clé de la qualité respiratoire. Un seuil bas (moins de 20 pas) est associé à une hyperventilation chronique, une respiration buccale nocturne et une aggravation des symptômes du SAOS. Le comptage de pas remplace le chronomètre : plus intuitif, moins anxiogène, et reproductible en autonomie.",
    expected_benefits_fr: [
      "Comprendre d'où vous partez et voir votre progression semaine après semaine",
      "Moins de bouche sèche et de gorge irritée au réveil",
      "Réduction progressive du ronflement en 3 à 6 semaines de pratique",
      "Un score qui augmente = des voies aériennes qui s'ouvrent",
    ],
    progression_fr: "Semaines 1-2 : 10 à 25 pas est tout à fait normal. Semaines 3-4 : viser 25 à 40 pas. À partir de la semaine 5 : objectif 40 pas et plus. Un score de 60 pas ou plus indique une bonne tolérance au CO2.",
    therapist_note_fr: "Équivalent clinique du BOLT (Body Oxygen Level Test) adapté au contexte FR, ne pas utiliser ce terme avec le patient. Score < 10 = hyperventilation chronique probable, investiguer la fréquence respiratoire au repos. Suivre l'évolution hebdomadaire : un gain de 5 pas/semaine est un bon rythme. Attention : ne pas faire après un effort ou un repas.",
    duration_seconds: 300,
    difficulty: 1,
    // Apnée volontaire : contre-indiquée en SAOS sévère non traité (risque
    // d'hypoxie). La contre-indication est déclarée explicitement, pas
    // seulement déduite de target_profile, car c'est elle qui fait foi côté
    // filtrage (voir getExercisesForProfile).
    contraindications: ["adult_saos_severe"],
    instructions_fr: [
      "Asseyez-vous et respirez normalement par le nez pendant 30 secondes.",
      "Expirez doucement, pas à fond, juste naturellement.",
      "Pincez le nez avec deux doigts et levez-vous.",
      "Marchez lentement en retenant le souffle.",
      "Au premier signal de manque d'air modéré, arrêtez-vous et notez vos pas.",
      "Relâchez le nez et reprenez une respiration calme et nasale.",
    ],
    tips_fr: [
      "Cherchez un léger manque d'air, pas une sensation d'étouffement. Si vous toussez ou ouvrez la bouche, c'est que vous avez tenu trop longtemps.",
      "Faites le test le matin, avant de manger et avant tout effort. Les conditions doivent être les mêmes chaque semaine.",
    ],
    metrics_tracked: ["pause_steps", "pause_score"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "🚶",
    color: "forest",
    requiresInput: true,
    inputLabel: "Nombre de pas effectués",
    inputUnit: "pas",
  },

  {
    id: "pause_20",
    category: "pause_controlee",
    name_fr: "Pause 20 secondes",
    description_fr: "Tenez une pause nasale confortable de 20 secondes. Le timer vous guide, restez détendu, c'est la régularité qui compte, pas la performance.",
    clinical_rationale_fr: "Une pause de 20 secondes correspond à un niveau de tolérance CO2 intermédiaire. La pratique régulière recalibre le centre respiratoire du tronc cérébral, qui accepte progressivement des niveaux de CO2 plus élevés sans déclencher d'envie d'air. Résultat : respiration plus lente, plus profonde, plus nasale, y compris la nuit.",
    expected_benefits_fr: [
      "Fréquence respiratoire au repos qui descend vers 12 à 14 cycles par minute",
      "Moins de micro-réveils liés aux micro-apnées légères",
      "Bouche qui reste fermée plus naturellement, même sans y penser",
      "Progression vers la pause 25 secondes en 2 à 4 semaines",
    ],
    progression_fr: "3 à 5 répétitions par séance, 1 à 2 fois par jour. Passer à la pause 25 secondes quand 20 secondes est tenu confortablement 3 séances de suite, sans forcer.",
    therapist_note_fr: "Observer la reprise respiratoire après la pause : si le patient respire par la bouche en reprenant, la pause est trop longue ou le patient pousse trop fort. La reprise doit toujours être nasale et calme. Fréquence cible : quotidienne les 2 premières semaines.",
    duration_seconds: 600,
    difficulty: 2,
    contraindications: ["adult_saos_severe"],
    instructions_fr: [
      "Respirez calmement par le nez pendant 1 minute pour vous préparer.",
      "Expirez doucement et pincez le nez.",
      "Maintenez la pause en restant immobile, assis ou debout.",
      "Visez 20 secondes. Si c'est difficile, visez d'abord 15.",
      "Relâchez et reprenez par le nez, lentement, sans précipiter.",
      "Attendez 1 à 2 minutes de récupération avant la prochaine répétition.",
    ],
    tips_fr: [
      "Si vous ressentez des vertiges, raccourcissez la pause. Ce n'est pas un concours.",
      "La reprise après la pause doit être aussi calme que si vous n'aviez rien fait.",
    ],
    metrics_tracked: ["pause_duration", "comfort_level"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "⏸️",
    color: "copper",
    requiresInput: true,
    inputLabel: "Durée de pause atteinte",
    inputUnit: "secondes",
  },

  {
    id: "pause_25",
    category: "pause_controlee",
    name_fr: "Pause 25 secondes",
    description_fr: "Niveau avancé. 25 secondes de pause confortable, la cible du programme. Vous êtes là parce que vous avez déjà maîtrisé les 20 secondes.",
    clinical_rationale_fr: "Une pause de 25 secondes ou plus correspond à un seuil de tolérance CO2 élevé. À ce niveau, les études Buteyko montrent que la fréquence respiratoire au repos descend sous 12 cycles par minute et que la tendance au ronflement diminue significativement. C'est la cible clinique pour le SAOS léger à modéré.",
    expected_benefits_fr: [
      "Fréquence respiratoire normalisée, moins de 12 cycles par minute au repos",
      "Ronflement diminué de façon mesurable et perceptible",
      "Sommeil plus profond, moins de réveils nocturnes",
      "Énergie diurne nettement améliorée",
    ],
    progression_fr: "Niveau à atteindre après 4 à 6 semaines de pratique régulière. Une fois atteint confortablement : maintien 3 fois par semaine en entretien.",
    therapist_note_fr: "Objectif cible du programme SAOS léger/modéré. Contre-indiqué en SAOS sévère non traité, risque d'hypoxie. Vérifier que le patient n'est pas en compétition avec lui-même : la pause doit rester confortable, jamais forcée jusqu'à l'essoufflement.",
    duration_seconds: 600,
    difficulty: 3,
    contraindications: ["adult_saos_severe"],
    instructions_fr: [
      "Respirez calmement par le nez pendant 2 minutes avant de commencer.",
      "Expirez lentement et pincez le nez.",
      "Maintenez la pause en gardant tout le corps détendu, mâchoire, épaules, ventre.",
      "Visez 25 secondes, arrêtez avant l'inconfort fort.",
      "Relâchez et reprenez par le nez, sans précipitation.",
      "Maximum 3 répétitions par séance, avec 2 minutes de repos entre chaque.",
    ],
    tips_fr: [
      "Si vous êtes stressé ou fatigué ce jour-là, réduisez à 20 secondes, c'est tout aussi utile.",
      "La régularité sur plusieurs semaines vaut bien mieux qu'une performance isolée.",
    ],
    metrics_tracked: ["pause_duration", "comfort_level"],
    target_profile: ["adult_saos_mild", "adult_mixed"],
    emoji: "🎯",
    color: "copper",
    requiresInput: true,
    inputLabel: "Durée de pause atteinte",
    inputUnit: "secondes",
  },

  // ═══════════════════════════════
  //  COHÉRENCE CARDIAQUE
  // ═══════════════════════════════

  {
    id: "coherence_5_5",
    category: "coherence_cardiaque",
    name_fr: "Cohérence cardiaque 5-5",
    description_fr: "Inspirez 5 secondes, expirez 5 secondes. Ce rythme synchronise votre cœur et votre respiration, 5 minutes suffisent pour changer votre état.",
    clinical_rationale_fr: "Le rythme à 6 cycles par minute (5-5) place le cœur en résonance avec les oscillations du baroréflexe. En 5 minutes, la variabilité de la fréquence cardiaque (VFC) augmente significativement, activant le système nerveux parasympathique. Pratiqué 3 fois par jour, cet exercice réduit le cortisol, améliore le tonus vasculaire des voies aériennes supérieures et améliore la qualité du sommeil profond.",
    expected_benefits_fr: [
      "Stress et anxiété réduits en 2 semaines, vous le sentirez",
      "Meilleure qualité de sommeil : endormissement plus rapide, moins de réveils",
      "Tonus musculaire des voies aériennes amélioré (moins d'affaissement nocturne)",
      "Tension artérielle stabilisée sur le long terme",
    ],
    progression_fr: "3 fois par jour dès le départ : matin au réveil, midi, soir avant de dormir. 5 minutes à chaque fois. La régularité prime sur la durée.",
    therapist_note_fr: "Exercice universel, prescrire à tous les profils dès la semaine 1. Idéalement pratiqué avant le coucher pour maximiser l'effet parasympathique nocturne. Suivre le nombre de séances par semaine (objectif : 21 séances/semaine). Si le patient trouve 5-5 difficile, commencer par 4-4.",
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    instructions_fr: [
      "Asseyez-vous confortablement, dos droit, épaules relâchées.",
      "Posez une main sur le ventre, il doit se soulever à l'inspiration.",
      "Inspirez lentement par le nez pendant 5 secondes.",
      "Expirez lentement (nez ou bouche) pendant 5 secondes.",
      "Enchaînez sans pause entre inspiration et expiration.",
      "Répétez pendant 5 minutes sans interruption.",
    ],
    tips_fr: [
      "Fermez les yeux et concentrez-vous sur la sensation de l'air dans les narines.",
      "Si vous perdez le rythme, ce n'est pas grave, reprenez simplement.",
    ],
    metrics_tracked: ["cycles_completed", "regularity_score"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "💚",
    color: "forest",
  },

  {
    id: "coherence_4_6",
    category: "coherence_cardiaque",
    name_fr: "Cohérence cardiaque 4-6 (soir)",
    description_fr: "Inspirez 4 secondes, expirez 6 secondes. L'expiration plus longue calme le système nerveux plus profondément, idéal pour préparer le corps au sommeil.",
    clinical_rationale_fr: "L'asymétrie 4-6 (expiration plus longue que l'inspiration) active le nerf vague de façon plus marquée qu'un rythme symétrique. Cette activation parasympathique prolongée réduit la fréquence cardiaque, abaisse le cortisol de fin de journée et prépare le corps à la phase de sommeil profond. Recommandé en soirée (Gevirtz 2013) pour les patients SAOS avec difficultés d'endormissement.",
    expected_benefits_fr: [
      "Endormissement plus rapide, l'effet se ressent dès la première semaine",
      "Fréquence cardiaque réduite au coucher",
      "Qualité du sommeil profond améliorée",
      "Idéal pour les patients SAOS avec anxiété du soir associée",
    ],
    progression_fr: "Uniquement en soirée, 5 minutes avant de se coucher. Peut remplacer le 5-5 du soir ou s'y ajouter. Combiner avec la respiration diaphragmatique pour un effet maximal.",
    therapist_note_fr: "Variante du 5-5 spécifiquement indiquée en soirée. Pour les patients SAOS avec insomnie associée, prescrire en combinaison avec la respiration 4-6-8 au moment du coucher. Si 4-6 est difficile, commencer par 4-5 les premiers jours.",
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    instructions_fr: [
      "Allongez-vous ou asseyez-vous dans l'obscurité ou la pénombre.",
      "Inspirez lentement par le nez pendant 4 secondes.",
      "Expirez doucement pendant 6 secondes, laissez le corps se relâcher.",
      "Pas de pause, pas de blocage : un flux continu inspiration-expiration.",
      "Répétez pendant 5 minutes, les yeux fermés.",
    ],
    tips_fr: [
      "L'expiration plus longue que l'inspiration est intentionnelle, c'est elle qui calme.",
      "Combiné avec la respiration diaphragmatique, l'effet est encore plus puissant.",
    ],
    metrics_tracked: ["cycles_completed", "regularity_score"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "💙",
    color: "forest",
  },

  // ═══════════════════════════════
  //  MYOFONCTIONNEL, LANGUE
  // ═══════════════════════════════

  {
    id: "langue_palais",
    category: "myofonctionnel",
    name_fr: "Langue au palais, position de repos",
    description_fr: "Apprenez où doit reposer votre langue : contre le palais, pas contre les dents. Ce geste simple est la base de tout le reste.",
    clinical_rationale_fr: "La position de repos linguale (toute la langue aspirée contre le palais dur, bouche fermée) est la correction myofonctionnelle la plus fondamentale. Une langue qui repose trop bas favorise la respiration buccale, l'affaissement nocturne des voies aériennes et la déglutition atypique. Corriger cette position améliore mécaniquement la posture mandibulaire et réduit le ronflement.",
    expected_benefits_fr: [
      "Fermeture buccale nocturne facilitée, moins de bouche sèche au réveil",
      "Langue qui ne tombe plus vers l'arrière-gorge pendant le sommeil",
      "Amélioration progressive de la posture cranio-cervicale",
      "Remodelage du palais sur 3 à 6 mois de pratique régulière",
    ],
    progression_fr: "Semaine 1 : 2 minutes par séance, 2 fois par jour. Semaine 3 : 3 minutes. Semaine 6 et au-delà : intégrer en continu dans la vie quotidienne, au bureau, en voiture, au repos.",
    therapist_note_fr: "Vérifier impérativement que TOUTE la langue (pas seulement la pointe) est en contact avec le palais. Erreur très fréquente : seule la pointe colle, le corps de la langue reste bas. Demander au patient de faire une légère succion pour sentir l'ensemble du dorsum lingual contre le palais.",
    duration_seconds: 120,
    difficulty: 1,
    instructions_fr: [
      "Placez la pointe de la langue juste derrière les incisives supérieures.",
      "Aspirez doucement, toute la langue doit coller au palais, pas seulement la pointe.",
      "Fermez la bouche et respirez exclusivement par le nez.",
      "Maintenez cette position pendant 2 minutes.",
      "Si la langue fatigue, relâchez 10 secondes et recommencez.",
    ],
    tips_fr: [
      "Imaginez faire une ventouse avec toute la surface de la langue contre le palais.",
      "Les dents sont légèrement écartées (1 à 2 mm), ne serrez pas les mâchoires.",
    ],
    metrics_tracked: ["hold_duration"],
    target_profile: ["adult_tmof", "adult_mixed", "adult_saos_mild"],
    emoji: "👅",
    color: "copper",
  },

  {
    id: "claquement_langue",
    category: "myofonctionnel",
    name_fr: "Claquements de langue",
    description_fr: "Claquez la langue contre le palais, bruit sec, comme un petit fouet. Simple, rapide, et plus efficace qu'il n'y paraît.",
    clinical_rationale_fr: "Le claquement lingual (L2 du protocole Guimarães 2009) active en séquence rapide les muscles élévateurs de la langue (génioglosse supérieur, palatoglosse). Cet exercice développe la mémoire neuromusculaire de la position palatale et prépare aux contractions isométriques. Il est particulièrement utile en début de protocole pour sensibiliser le patient à la position haute de la langue.",
    expected_benefits_fr: [
      "Prise de conscience immédiate de la position palatale de la langue",
      "Activation des muscles élévateurs linguaux",
      "Exercice intégrable partout, sous la douche, en voiture, en marchant",
      "Complément efficace aux exercices de déglutition",
    ],
    progression_fr: "Semaine 1 : 20 répétitions × 3 séries, 2 fois par jour. Semaine 2 et au-delà : augmenter la vitesse en gardant le bruit sec et franc. Intégrer dans la routine quotidienne.",
    therapist_note_fr: "Exercice de démarrage idéal, ludique, rapide, facile à mémoriser. Un bruit sec et net = bonne contraction. Un bruit mou ou sourd = langue pas assez ferme, corriger la posture de départ. Idéal pour les patients peu assidus ou peu à l'aise avec les exercices complexes.",
    duration_seconds: 90,
    difficulty: 1,
    instructions_fr: [
      "Placez la langue à plat contre le palais en faisant une légère succion.",
      "Ouvrez rapidement la bouche pour créer un claquement sec.",
      "Répétez en rythme régulier, environ un claquement par seconde.",
      "Effectuez 20 répétitions, reposez 10 secondes.",
      "Recommencez pour 3 séries.",
    ],
    tips_fr: [
      "Le bruit doit être sec et net. Silencieux = langue pas assez collée, recommencez plus lentement.",
      "Plus vous accélérez au fil des semaines, plus l'activation musculaire est intense.",
    ],
    metrics_tracked: ["reps_completed"],
    target_profile: ["adult_tmof", "adult_mixed", "adult_saos_mild"],
    emoji: "🔔",
    color: "copper",
  },

  {
    id: "pression_palatine",
    category: "myofonctionnel",
    name_fr: "Pression palatine, force maximale",
    description_fr: "Appuyez la langue contre le palais avec toute votre force et maintenez. C'est l'exercice le plus directement prouvé contre les apnées.",
    clinical_rationale_fr: "La pression palatine isométrique (L4, Guimarães 2009) est l'exercice myofonctionnel avec le plus haut niveau de preuve pour la réduction de l'IAH. En contractant le génioglosse en isométrie, on augmente son tonus de base, ce qui prévient mécaniquement l'affaissement des voies aériennes pendant le sommeil. La méta-analyse Camacho 2015 montre une réduction moyenne de 50% de l'IAH après 3 mois de protocole OMT incluant cet exercice.",
    expected_benefits_fr: [
      "Réduction mesurable de l'IAH dès 8 semaines de pratique régulière",
      "Tonus lingual augmenté au repos, la langue ne s'affaisse plus la nuit",
      "Moins d'apnées en position dorsale (la plus problématique)",
      "Amélioration de la saturation en oxygène nocturne",
    ],
    progression_fr: "Semaines 1-2 : 5 secondes × 10 répétitions, 1 fois par jour. Semaines 3-4 : 7 secondes × 12 répétitions. Semaine 5 et au-delà : 10 secondes × 15 répétitions, 2 fois par jour. Une légère fatigue de la langue est normale. Douleur cervicale = arrêter.",
    therapist_note_fr: "Exercice fondamental, niveau de preuve Fort (Guimarães 2009, Cochrane 2020). Prescrire en priorité pour SAOS léger/modéré dès la semaine 2. Vérifier que le patient sent l'effort dans le corps de la langue (pas seulement la pointe). Si l'effort est senti dans la nuque ou la mâchoire, corriger la position.",
    duration_seconds: 180,
    difficulty: 2,
    instructions_fr: [
      "Placez la langue entière à plat contre le palais dur.",
      "Appuyez avec la force maximale, comme si vous vouliez traverser le palais.",
      "Maintenez la contraction 5 secondes en respirant par le nez.",
      "Relâchez 3 secondes, puis recommencez.",
      "Effectuez 10 répétitions en série, bouche fermée.",
    ],
    tips_fr: [
      "Imaginez appuyer une éponge humide contre le palais, sentez toute la surface travailler.",
      "Seule la langue travaille. La mâchoire et le cou restent complètement relâchés.",
    ],
    metrics_tracked: ["reps_completed", "hold_duration"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "💪",
    color: "copper",
  },

  {
    id: "aspiration_linguale",
    category: "myofonctionnel",
    name_fr: "Ventouse linguale",
    description_fr: "Aspirez toute la langue contre le palais et maintenez. L'exercice le plus exigeant du programme, et le plus complet pour le tonus lingual.",
    clinical_rationale_fr: "L'aspiration linguale (L8, Guimarães 2009) active simultanément tous les muscles intrinsèques et extrinsèques de la langue, génioglosse, styloglosse, hyoglosse. La pression négative créée par l'aspiration génère une contraction plus profonde que la pression seule. À prescrire après la maîtrise de la pression palatine, car il en est l'extension avancée.",
    expected_benefits_fr: [
      "Activation musculaire maximale, tous les faisceaux linguaux en même temps",
      "Réduction significative des apnées en position dorsale",
      "Force linguale globale augmentée de façon mesurable",
      "Complément idéal à la cohérence cardiaque pour la nuit",
    ],
    progression_fr: "Semaines 1-2 : 15 secondes × 5 répétitions. Semaines 3-4 : 20 secondes × 8 répétitions. Semaine 5 et au-delà : 30 secondes × 10 répétitions. Ne prescrire qu'après 3 semaines de pression palatine maîtrisée.",
    therapist_note_fr: "Exercice de niveau 3, ne pas prescrire dès le départ. Indicateur de bonne exécution : on entend un léger claquement à l'aspiration initiale. Si le patient ne peut pas maintenir 15 secondes en tension réelle (langue qui glisse), retourner à la pression palatine 2 semaines supplémentaires.",
    duration_seconds: 240,
    difficulty: 3,
    instructions_fr: [
      "Ouvrez légèrement la bouche, juste assez pour voir la langue.",
      "Aspirez toute la langue contre le palais, comme une ventouse sur une vitre.",
      "Fermez doucement la bouche en maintenant l'aspiration.",
      "Respirez par le nez tout en gardant la langue collée.",
      "Maintenez 15 à 30 secondes selon votre niveau.",
      "Relâchez, récupérez 10 secondes, puis répétez.",
    ],
    tips_fr: [
      "Un petit claquement à l'aspiration = bonne ventouse. Pas de son = à refaire.",
      "Si la langue glisse vers le bas, la contraction se relâche, recommencez depuis le début.",
    ],
    metrics_tracked: ["hold_duration", "reps_completed"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "🪄",
    color: "copper",
  },

  {
    id: "deglutition_atypique",
    category: "myofonctionnel",
    name_fr: "Déglutition à langue haute",
    description_fr: "Apprenez à avaler correctement : langue contre le palais, jamais contre les dents. Cette correction change la posture de votre langue 24h/24.",
    clinical_rationale_fr: "La déglutition atypique (poussée linguale contre les dents) est présente chez la majorité des patients TMOF et SAOS. Elle maintient la langue en position basse, favorise la respiration buccale et aggrave l'instabilité occlusale. Rééduquer le réflexe de déglutition vers la position palatale est fondamental, chaque patient déglutit 500 à 700 fois par jour, autant d'opportunités d'entraîner le bon réflexe.",
    expected_benefits_fr: [
      "Langue qui reste haute au repos, même sans y penser, automatisation en 6 à 8 semaines",
      "Stabilisation progressive de l'occlusion dentaire",
      "Réduction de la respiration buccale liée à la mauvaise position linguale",
      "Moins de tensions maxillo-mandibulaires et de maux de tête cervicaux",
    ],
    progression_fr: "Semaines 1-2 : 10 déglutitions conscientes × 2 séries, 2 fois par jour. Semaines 3-4 : 15 déglutitions × 2 séries. Semaine 5 et au-delà : automatisation, pratiquer consciemment à chaque repas et à chaque gorgée.",
    therapist_note_fr: "Exercice fondamental en TMOF. Observer la langue pendant toute la déglutition : elle doit rester au palais du début à la fin. Erreur fréquente : la langue revient contre les dents juste après avoir avalé. Progression en 3 étapes : salive → eau → aliments mous. Vérifier que le menton ne bouge pas (test du doigt sous le menton).",
    duration_seconds: 180,
    difficulty: 2,
    instructions_fr: [
      "Placez la langue sur le palais dur, pointe derrière les incisives supérieures.",
      "Fermez la bouche, dents légèrement écartées (1 à 2 mm).",
      "Avalez votre salive en gardant la langue collée au palais.",
      "La langue ne doit JAMAIS toucher les dents pendant la déglutition.",
      "Sentez la gorge se contracter, c'est elle qui fait le travail, pas la langue.",
      "Répétez 10 fois, reposez 30 secondes, puis 10 autres fois.",
    ],
    tips_fr: [
      "Mettez un doigt sous le menton : il ne doit pas bouger si la déglutition est correcte.",
      "Progressez de la salive à l'eau, puis aux aliments, dans cet ordre.",
    ],
    metrics_tracked: ["reps_completed"],
    target_profile: ["adult_tmof", "adult_mixed"],
    emoji: "🌊",
    color: "copper",
  },

  {
    id: "propulsion_linguale",
    category: "myofonctionnel",
    name_fr: "Résistance linguale à la cuillère",
    description_fr: "Poussez la langue contre une cuillère sans la faire bouger. Ce travail en résistance renforce les muscles profonds de la langue.",
    clinical_rationale_fr: "L'hypotonie linguale (langue sans tonus) est un facteur majeur du SAOS, la langue molle s'affaisse sur les voies aériennes dès que les muscles se relâchent en sommeil profond. Le renforcement en résistance isométrique (cuillère fixe) cible les muscles intrinsèques verticaux, transversaux et longitudinaux. Les études montrent une réduction de 30% des apnées après 8 semaines de renforcement lingual régulier.",
    expected_benefits_fr: [
      "Tonus lingual significativement augmenté en 6 à 8 semaines",
      "Langue qui ne s'affaisse plus en position dorsale pendant le sommeil",
      "Réduction de la fréquence des apnées, mesurable sur oxymètre",
      "Respiration nasale facilitée par la meilleure position linguale",
    ],
    progression_fr: "Semaines 1-2 : 5 secondes de résistance × 10 répétitions, 1 fois par jour. Semaines 3-4 : 7 secondes × 15 répétitions. Semaine 5 et au-delà : 10 secondes × 20 répétitions, 2 fois par jour si bien toléré.",
    therapist_note_fr: "Très efficace pour SAOS sévère ET TMOF. La cuillère doit créer une vraie résistance, le patient doit sentir le muscle travailler intensément. Si la cuillère bouge, le patient ne fait pas d'isométrie : reprendre avec une cuillère tenue fermement. Peut être fait avec une spatule de kiné pour encore plus de résistance.",
    duration_seconds: 120,
    difficulty: 1,
    instructions_fr: [
      "Tenez une cuillère à café horizontalement devant vous.",
      "Posez le dos de la cuillère sur le milieu de la langue.",
      "Poussez la langue vers l'avant et vers le haut contre la cuillère.",
      "La cuillère ne doit PAS bouger, vous créez une résistance fixe.",
      "Maintenez la contraction 5 secondes, relâchez 3 secondes.",
      "Répétez 10 fois, vous devez sentir la langue travailler.",
    ],
    tips_fr: [
      "Si c'est trop facile, tenez la cuillère plus fermement ou utilisez une cuillère plus lourde.",
      "Pratiquez le matin et avant le coucher pour maximiser le tonus nocturne.",
    ],
    metrics_tracked: ["reps_completed", "hold_duration"],
    target_profile: ["adult_tmof", "adult_mixed", "adult_saos_severe"],
    emoji: "🥄",
    color: "copper",
  },

  // ═══════════════════════════════
  //  MYOFONCTIONNEL, VOILE DU PALAIS
  // ═══════════════════════════════

  {
    id: "gargarisme_sec",
    category: "myofonctionnel",
    name_fr: "Gargarisme, voile du palais",
    description_fr: "Gargarisez-vous pour renforcer le voile du palais, la structure qui s'affaisse pendant les apnées. Simple et efficace, avec ou sans eau.",
    clinical_rationale_fr: "Le gargarisme active les muscles du voile du palais : tenseur du voile palatin, élévateur du voile palatin, palatopharyngien. Ces muscles maintiennent les voies aériennes supérieures ouvertes en position de sommeil. Un voile hypotonique (mou) est une cause directe de ronflement et d'apnées. Le gargarisme est l'un des exercices vélaires les plus accessibles, validé dans les protocoles OMT (Camacho 2015, Rueda 2020).",
    expected_benefits_fr: [
      "Voile du palais plus ferme, moins d'affaissement nocturne",
      "Ronflement réduit, notamment en position sur le dos",
      "Meilleure réponse musculaire du voile aux variations de pression respiratoire",
      "Exercice réalisable partout, sans aucun matériel",
    ],
    progression_fr: "Semaine 1 : 3 × 30 secondes avec de l'eau, 2 fois par jour. Semaine 2 et au-delà : 3 × 45 secondes. Semaine 4 et au-delà : variante à sec (sans eau), plus difficile, plus efficace.",
    therapist_note_fr: "Commencer avec de l'eau pour faciliter l'apprentissage. La variante à sec est plus efficace car il n'y a pas d'appui liquidien, activation musculaire plus pure. Vérifier au miroir que le voile (luette) se soulève bien à chaque gargarisme. Si le voile ne bouge pas, le patient fait vibrer les cordes vocales, pas le voile, corriger.",
    duration_seconds: 180,
    difficulty: 1,
    instructions_fr: [
      "Prenez une gorgée d'eau, ou commencez à sec pour le niveau avancé.",
      "Inclinez légèrement la tête en arrière (30 degrés environ).",
      "Faites vibrer le fond de la gorge pendant 30 secondes.",
      "Regardez dans un miroir : la luette doit se soulever à chaque gargarisme.",
      "Reposez 10 secondes, puis recommencez pour 3 séries.",
    ],
    tips_fr: [
      "Observez votre luette au miroir : elle doit danser à chaque gargarisme.",
      "Si vous toussez, la tête est trop inclinée, réduisez légèrement l'angle.",
    ],
    metrics_tracked: ["reps_completed"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "💧",
    color: "forest",
  },

  {
    id: "phonemes_velaires",
    category: "myofonctionnel",
    name_fr: "Ka-Ga, phonèmes du fond de gorge",
    description_fr: "Répétez rapidement 'Ka' et 'Ga'. Ces sons activent le fond de la gorge de façon dynamique, là où se produisent les apnées.",
    clinical_rationale_fr: "Les phonèmes vélaires (K, G) sollicitent spécifiquement le voile du palais et la paroi postérieure du pharynx. La répétition rapide crée un entraînement dynamique (rythmique) des muscles vélopharyngés, complémentaire au gargarisme qui est lui statique. Utilisé en rééducation vélopharyngée (protocoles De Felício 2018). La variante chuchotée est la plus efficace car elle supprime l'appui des cordes vocales.",
    expected_benefits_fr: [
      "Activation dynamique du voile du palais, différente du gargarisme",
      "Réflexe de fermeture vélopharyngée renforcé",
      "Voile plus réactif aux variations de pression nocturnes",
      "Exercice discret, réalisable en voiture ou dans les transports",
    ],
    progression_fr: "Semaine 1 : 3 × 30 secondes de Ka-Ka-Ka-Ga-Ga, 2 fois par jour. Semaine 2 et au-delà : alterner Ka-Ga-Ka-Ga en accélérant progressivement. Semaine 4 et au-delà : variante chuchotée, sans voix.",
    therapist_note_fr: "La version chuchotée est cliniquement plus efficace, elle isole le voile sans l'aide des cordes vocales. Corriger si le patient fait les sons avec les lèvres plutôt que le fond de la gorge : le Ka doit résonner derrière la bouche, pas sur les lèvres.",
    duration_seconds: 120,
    difficulty: 1,
    instructions_fr: [
      "Tenez-vous droit, bouche légèrement ouverte.",
      "Répétez 'Ka-Ka-Ka' rapidement, 10 fois de suite, sentez le fond de la gorge travailler.",
      "Puis répétez 'Ga-Ga-Ga' rapidement, 10 fois de suite.",
      "Alternez Ka et Ga en accélérant progressivement.",
      "Faites 3 séries de 30 secondes avec 10 secondes de repos entre chaque.",
    ],
    tips_fr: [
      "Le son vient du fond de la gorge, pas des lèvres. Posez un doigt sur les lèvres, elles ne bougent presque pas.",
      "Version avancée : chuchotez les sons sans voix. C'est plus difficile et plus efficace.",
    ],
    metrics_tracked: ["reps_completed"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "🎵",
    color: "forest",
  },

  // ═══════════════════════════════
  //  RESPIRATION NASALE
  // ═══════════════════════════════

  {
    id: "nasale_guerrier",
    category: "respiration_nasale",
    name_fr: "Marche nasale",
    description_fr: "Marchez en respirant uniquement par le nez. Si l'envie d'ouvrir la bouche est forte, ralentissez, ne jamais ouvrir. L'objectif est 3 minutes sans bouche.",
    clinical_rationale_fr: "La respiration nasale pendant l'effort léger reconditionne le réflexe ventilatoire vers la voie nasale. Le nez produit du monoxyde d'azote (NO), un vasodilatateur local qui améliore la saturation en O2 et l'efficacité respiratoire. La marche nasale oblige progressivement le système à s'adapter à un débit d'air réduit, ce qui renforce la tolérance au CO2 en parallèle.",
    expected_benefits_fr: [
      "Réduction progressive de la respiration buccale, y compris la nuit",
      "Meilleure filtration, humidification et réchauffement de l'air inspiré",
      "Augmentation du NO nasal, saturation en O2 améliorée",
      "Conditionnement progressif vers le sommeil bouche fermée",
    ],
    progression_fr: "Semaine 1 : 3 minutes de marche nasale. Semaine 3 : 5 minutes. Semaine 6 : 10 minutes de marche rapide en nasale exclusive.",
    therapist_note_fr: "Si le patient ne tient pas 3 minutes à allure normale, prescrire d'abord la marche lente. Règle clé à transmettre : si envie de bouche = ralentir le pas, jamais ouvrir la bouche. La légère sensation de manque d'air est bénéfique, elle entraîne la tolérance au CO2.",
    duration_seconds: 180,
    difficulty: 2,
    instructions_fr: [
      "Commencez à marcher à un rythme modéré, celui d'une promenade.",
      "Respirez exclusivement par le nez : inspiration ET expiration.",
      "Si l'envie d'ouvrir la bouche est forte : ralentissez le pas.",
      "Ne jamais ouvrir la bouche, à la place, trouvez le rythme où le nez suffit.",
      "Maintenez pendant 3 minutes en respirant silencieusement.",
    ],
    tips_fr: [
      "Marchez à un rythme où vous pourriez tenir une conversation, ni trop vite, ni trop lent.",
      "La légère sensation de manque d'air est normale et bienvenue, c'est elle qui entraîne le corps.",
    ],
    metrics_tracked: ["duration_nasal_only"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "🌬️",
    color: "forest",
  },

  {
    id: "narine_alternee",
    category: "respiration_nasale",
    name_fr: "Respiration par narine alternée",
    description_fr: "Bouchez une narine, inspirez par l'autre, puis alternez. Décongestionne les voies nasales et rééduque la respiration nasale bilatérale.",
    clinical_rationale_fr: "La respiration par narine alternée stimule les deux hémisphères nasaux en alternance. La congestion nasale chronique est un facteur aggravant du SAOS car elle augmente la résistance nasale et force à la respiration buccale. Cet exercice stimule la production de monoxyde d'azote nasal, améliore la clairance mucociliaire et restaure le cycle nasal naturel (alternance spontanée toutes les 90 minutes).",
    expected_benefits_fr: [
      "Décongestion progressive, les narines s'ouvrent plus facilement",
      "Réduction de la résistance nasale à l'inspiration",
      "Meilleure filtration et humidification de l'air",
      "Idéal pour les patients avec congestion nasale chronique ou allergique",
    ],
    progression_fr: "Semaine 1 : 5 minutes par jour. Semaine 2 et au-delà : 2 × 5 minutes. Semaine 4 et au-delà : 10 minutes matin et soir. Combiner avec la marche nasale pour un effet maximal.",
    therapist_note_fr: "À prescrire en cas de congestion nasale chronique (allergies, tabac, pollution). Contre-indication : déviation septale sévère ou polypes nasaux, orienter vers ORL avant de prescrire. Si une narine est très bouchée au départ, commencer toujours par la narine libre (côté gauche si congestion droite).",
    duration_seconds: 300,
    difficulty: 1,
    instructions_fr: [
      "Asseyez-vous confortablement, dos droit, coude droit levé.",
      "Bouchez la narine droite avec le pouce droit.",
      "Inspirez lentement et complètement par la narine gauche.",
      "Bouchez la narine gauche avec l'annulaire. Relâchez le pouce.",
      "Expirez lentement par la narine droite.",
      "Inspirez par la droite, bouchez, expirez par la gauche. Répétez le cycle pendant 5 minutes.",
    ],
    tips_fr: [
      "La transition entre les narines doit être douce, pas de blocage brutal.",
      "Si une narine est très bouchée, commencez par l'autre côté et alternez doucement.",
    ],
    metrics_tracked: ["cycles_completed", "duration_nasal_only"],
    target_profile: ["adult_saos_mild", "adult_tmof", "adult_mixed"],
    emoji: "👃",
    color: "forest",
  },

  // ═══════════════════════════════
  //  DIAPHRAGMATIQUE
  // ═══════════════════════════════

  {
    id: "diaphragmatique",
    category: "diaphragmatique",
    name_fr: "Respiration abdominale",
    description_fr: "Inspirez en gonflant le ventre, pas la poitrine. C'est la respiration naturelle du corps. La plupart des adultes ont perdu ce réflexe et respirent trop haut.",
    clinical_rationale_fr: "La respiration thoracique haute est associée à l'hyperventilation chronique, l'anxiété et une oxygénation sous-optimale. Le diaphragme, muscle principal de la respiration, est sous-utilisé chez la majorité des patients SAOS. Le rééduquer réduit la fréquence respiratoire au repos, améliore les échanges gazeux alvéolaires et active le système nerveux parasympathique par stimulation vagale directe.",
    expected_benefits_fr: [
      "Fréquence respiratoire au repos qui descend, objectif : moins de 14 cycles par minute",
      "Activation du système nerveux parasympathique, vous vous sentirez plus calme",
      "Meilleure oxygénation des tissus avec moins d'effort respiratoire",
      "Tensions dans le cou et les épaules réduites, elles compensaient la respiration haute",
    ],
    progression_fr: "Semaine 1 : 5 minutes, 3 fois par jour (matin, midi, soir). Semaine 2 et au-delà : intégrer à la marche et aux moments de repos. Semaine 4 et au-delà : vérifier que la respiration diaphragmatique est devenue le mode automatique au repos.",
    therapist_note_fr: "Exercice fondamental, à prescrire à tous les profils dès la semaine 1. Test de référence : une main sur le ventre, une main sur la poitrine, seul le ventre doit bouger. Si la poitrine monte, le patient n'utilise pas le diaphragme. Beaucoup de patients SAOS sont des respirateurs thoraciques chroniques : cet exercice change leur mécanique de base.",
    duration_seconds: 300,
    difficulty: 1,
    instructions_fr: [
      "Allongez-vous sur le dos ou asseyez-vous confortablement.",
      "Posez une main sur le ventre (nombril) et l'autre sur la poitrine.",
      "Inspirez lentement par le nez : seule la main sur le ventre doit se lever.",
      "La main sur la poitrine reste immobile, si elle bouge, recommencez plus doucement.",
      "Expirez lentement, le ventre redescend naturellement sans effort.",
      "Répétez pendant 5 minutes à votre rythme naturel.",
    ],
    tips_fr: [
      "Imaginez un ballon qui se gonfle dans votre ventre à chaque inspiration.",
      "Si votre poitrine monte malgré vous, concentrez-vous sur le nombril qui s'éloigne de la colonne.",
    ],
    metrics_tracked: ["cycles_completed", "breath_rate"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "🫁",
    color: "forest",
  },

  // ═══════════════════════════════
  //  RELAXATION
  // ═══════════════════════════════

  {
    id: "respiration_4_6_8",
    category: "relaxation",
    name_fr: "Respiration 4-6-8 (endormissement)",
    description_fr: "Inspirez 4 sec, retenez 6 sec, expirez 8 sec. Cet enchaînement ralentit profondément le système nerveux, à pratiquer dans le lit, avant de dormir.",
    clinical_rationale_fr: "Le pattern 4-6-8 (Dr Weil) crée un ralentissement progressif du système nerveux sympathique. L'expiration prolongée (8 secondes) active fortement le nerf vague et le système parasympathique. La rétention (6 secondes) augmente légèrement le CO2 sanguin, ce qui contribue à la vasodilatation et à la réduction de la fréquence cardiaque. Utilisé en accompagnement des approches cognitivo-comportementales de l'insomnie associée au SAOS. Aucune donnée chiffrée d'efficacité propre à ce pattern n'est disponible : à présenter comme une aide à l'endormissement, pas comme un traitement.",
    expected_benefits_fr: [
      "Endormissement plus rapide, l'effet se ressent dès la première semaine",
      "Système nerveux parasympathique activé : fréquence cardiaque et pression artérielle abaissées",
      "Cortisol nocturne réduit, moins de ruminations au coucher",
      "Complément naturel aux autres traitements du SAOS",
    ],
    progression_fr: "Uniquement au coucher ou lors d'un réveil nocturne. 4 cycles par session maximum. Ne jamais pratiquer debout, risque de vertiges au début. Si 4-6-8 est trop difficile, commencer par 3-4-6.",
    therapist_note_fr: "À prescrire pour les patients SAOS avec comorbidité insomnie, fréquent (40 à 60% des cas). Contre-indiqué en cas d'anxiété sévère liée à la respiration (peut déclencher des attaques de panique chez les patients hypervigilants à leurs sensations corporelles). Variante d'initiation : 3-4-6.",
    duration_seconds: 240,
    difficulty: 2,
    instructions_fr: [
      "Allongez-vous dans votre lit, lumières éteintes.",
      "Fermez les yeux et relâchez les épaules, la mâchoire, les mains.",
      "Inspirez silencieusement par le nez pendant 4 secondes.",
      "Retenez doucement pendant 6 secondes, sans contracter, juste maintenir.",
      "Expirez lentement pendant 8 secondes, laissez le corps se relâcher complètement.",
      "Répétez 4 cycles. Ne forcez jamais la rétention.",
    ],
    tips_fr: [
      "Si 4-6-8 est difficile au début, commencez par 3-4-6 et augmentez progressivement.",
      "L'effet se ressent surtout à partir du 3e ou 4e cycle, continuez même si les premières secondes sont inconfortables.",
    ],
    metrics_tracked: ["cycles_completed"],
    target_profile: ["adult_saos_mild", "adult_saos_severe", "adult_tmof", "adult_mixed"],
    emoji: "🌙",
    color: "forest",
  },

];

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  pause_controlee: "Pause Contrôlée",
  coherence_cardiaque: "Cohérence Cardiaque",
  respiration_nasale: "Respiration Nasale",
  myofonctionnel: "Myofonctionnel",
  diaphragmatique: "Diaphragmatique",
  relaxation: "Relaxation & Sommeil",
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Débutant",
  2: "Intermédiaire",
  3: "Avancé",
};

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

/**
 * Catégories reposant sur une apnée volontaire prolongée. Tant qu'aucun profil
 * clinique n'a été prescrit, elles ne sont pas proposées : retenir son souffle
 * sans encadrement expose un patient en SAOS sévère non diagnostiqué à un
 * risque d'hypoxie.
 */
const CATEGORIES_REQUIRING_PRESCRIBED_PROFILE: ExerciseCategory[] = ["pause_controlee"];

/**
 * Exercices autorisés pour un profil donné.
 *
 * Deux filtres, dans cet ordre :
 *   1. la contre-indication explicite, qui prime toujours ;
 *   2. le ciblage par profil.
 *
 * Ne jamais filtrer sur le seul `target_profile` : une contre-indication
 * ajoutée sans mise à jour du ciblage passerait à travers.
 */
export function getExercisesForProfile(profile: PatientProfileType): Exercise[] {
  return EXERCISES.filter(
    (e) => !e.contraindications?.includes(profile) && e.target_profile.includes(profile),
  );
}

/**
 * Exercices proposés à un patient dont le praticien n'a pas encore prescrit de
 * profil. Volontairement restreint : tout ce qui demande une apnée volontaire
 * attend la prescription.
 */
export function getExercisesWithoutProfile(): Exercise[] {
  return EXERCISES.filter((e) => !CATEGORIES_REQUIRING_PRESCRIBED_PROFILE.includes(e.category));
}

/** Point d'entrée unique côté écran patient. */
export function getVisibleExercises(profile: PatientProfileType | null): Exercise[] {
  return profile ? getExercisesForProfile(profile) : getExercisesWithoutProfile();
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}
