# ParlerMoinsVite - Documentation Technique Complète

## 🎯 Vision & Mission

**ParlerMoinsVite** est une application web d'entraînement vocal et de régulation du débit de parole, conçue pour les personnes souffrant de bredouillement (cluttering) et de bégaiement. L'application propose un suivi autonome à domicile en complément du travail clinique avec un orthophoniste.

**Fondateur** : Clément Pontegnier, lui-même ancien patient suivi pour bredouillement par Audrey Laydernier (2022).

**URL publique** : https://parlermoinsvite.lovable.app

---

## 💼 Modèle Business Dual : B2B + B2C

### 1. B2B "Therapist-Pays"

#### Principe
Les **orthophonistes** paient pour leurs patients actifs. Les patients bénéficient d'un **accès complet gratuit** lorsqu'ils sont liés à un praticien avec un abonnement valide.

#### Implémentation Technique
- L'accès patient est déterminé par `profiles.linked_therapist_id`
- Vérification via `useLimitCheck.tsx` : patient lié à thérapeute avec trial/abonnement actif = accès complet
- **Aucun paywall, badge "Premium", ou CTA vers /pricing** n'est affiché côté patient B2B

### 2. B2C "Mode Autonomie" (Solo)

#### Principe
Les patients peuvent s'inscrire **sans Code Pro** d'orthophoniste. Ils bénéficient d'un **essai gratuit de 7 jours**, puis d'un abonnement à **9€/mois** (cadré comme "moins de 2 cafés par mois ☕").

#### Parcours Solo
1. **Inscription** sans Code Pro → `trial_end_date` = now() + 7 jours
2. **Dashboard "Mode Autonomie"** : masque les composants thérapeute, affiche un `TrialBanner` avec décompte et prix
3. **Fin d'essai** : redirection vers paiement Stripe (9€/mois)
4. **À tout moment** : le patient peut lier un Code Pro via les paramètres → bascule en mode B2B

#### Implémentation Technique
- Détection solo : `!linked_therapist_id && !is_therapist`
- Trial actif : `trial_end_date && new Date(trial_end_date) > new Date()`
- Accès payant solo : `subscription_status === 'active'` sans thérapeute lié
- CGV : Article 4 (Abonnement Professionnel B2B) et Article 5 (Abonnement Autonome B2C) distincts dans `/legal/terms`

#### Pricing & Communication
- Prix : **9€/mois** affiché sur le dashboard (TrialBanner), la landing patient, et la page de résiliation
- Analogie : "Moins de 2 cafés par mois ☕" utilisée partout (UI, emails, landing)
- Justification affichée : hébergement sécurisé, exercices mis à jour, support humain

### Composants Retirés (v2.1)
| Fichier | Raison |
|---------|--------|
| `UserBadge.tsx` | Affichait "PREMIUM" ou "ACCÈS COMPLET" - distinction inutile |
| `BlurredAnalyticsCard.tsx` | Composant paywall - plus utilisé |

### Props Supprimées
- `isPremium` retirée de : `PatientProgressCard`, `FillerCard`, `CoachBilan`
- Tous les overlays de blur avec Lock icon supprimés

---

## 🏗️ Architecture Technique

### Stack Principal
| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn UI, Framer Motion |
| **Design System** | v3 "Soft & Organique" — Nunito (display) + DM Sans (body), palette crème/teal/pêche, radius 1.125rem, ombres diffuses teintées, animations cubic-bezier(0.22,1,0.36,1) |
| **Backend** | Supabase (Lovable Cloud) |
| **Audio** | MediaRecorder API, Deepgram Nova-2, wavesurfer.js |
| **Paiement** | Stripe (B2B : 9€/mois ou 79€/an par ortho, B2C : 9€/mois par patient solo) |
| **PDF** | @react-pdf/renderer |

### Edge Functions
| Fonction | Description |
|----------|-------------|
| `get-deepgram-token` | Génère un token temporaire Deepgram (1 heure) pour transcription temps réel |
| `create-checkout-session` | Crée une session Stripe Checkout avec métadonnées utilisateur |
| `stripe-webhook` | Gère 7 événements Stripe + récompenses parrainage automatiques (coupon Stripe 100% 1 mois) |
| `send-welcome-email` | Email de bienvenue (détecte solo via `isSolo` flag) |
| `send-email` | Moteur d'envoi multi-templates (20+ types dont parrainage) |
| `scheduled-emails` | Cron quotidien : inactivité, fins d'essai B2B/B2C, bilans hebdo |
| `notify-first-win` | Notification 1ère session complétée |
| `notify-patient-joined` | Alerte thérapeute quand patient rejoint |
| `notify-referral-applied` | Notifie le parrain quand son code est utilisé |
| `notify-comment` | Notifie le patient par email quand l'ortho commente une séance |
| `notify-prescription` | Notifie le patient quand l'ortho prescrit un exercice |
| `analyze-retelling` | Analyse IA de la restitution narrative (points clés, concision, organisation, digressions) via Gemini |
| `admin-stats` | Statistiques admin globales |

### Tables Principales
| Table | Colonnes Clés | Description |
|-------|---------------|-------------|
| `profiles` | `id`, `full_name`, `birth_year`, `is_premium`, `is_therapist`, `current_streak`, `longest_streak`, `daily_goal`, `today_minutes`, `last_activity_date`, `target_wpm`, `linked_therapist_id`, `therapist_code`, `stripe_customer_id`, `subscription_status`, `subscription_plan`, `trial_start_date`, `trial_end_date`, `referral_code`, `referral_bonus_months`, `seats_limit`, `is_archived`, `last_engagement_email_at` | Profils utilisateurs avec gamification et abonnement |
| `sessions` | `id`, `user_id`, `avg_wpm`, `max_wpm`, `duration_seconds`, `exercise_type`, `target_wpm`, `recording_url`, `word_timestamps`, `wpm_data`, `patient_sentiment`, `notes` | Sessions d'entraînement avec métriques |
| `session_comments` | `id`, `session_id`, `author_id`, `content`, `is_read` | Feedback orthophoniste |
| `clinical_notes` | `id`, `patient_id`, `therapist_id`, `content`, `is_private` | Notes cliniques privées |
| `assignments` | `id`, `patient_id`, `therapist_id`, `exercise_category`, `exercise_id`, `status`, `completed_session_id` | Exercices prescrits |
| `therapist_directory` | `id`, `user_id`, `display_name`, `city`, `zip_code`, `specialties`, `is_listed`, `accepts_new_patients` | Annuaire orthophonistes |

---

## 📊 Algorithmes de Calcul SPS

### Principe Fondamental
Le **SPS (Syllabes Par Seconde)** est calculé selon la méthode **Articulation Rate** de Van Zaalen (2009) :
- **Numérateur** : Nombre de syllabes prononcées
- **Dénominateur** : Temps d'articulation réel (silences EXCLUS)

### Hook `useDeepgramSPS.ts` - Paramètres Techniques

```typescript
// Constantes critiques
const SPS_WINDOW_SECONDS = 2;        // Fenêtre glissante de 2 secondes
const SPS_UPDATE_INTERVAL_MS = 150;  // Rafraîchissement toutes les 150ms
const AUDIO_BUFFER_SIZE = 1024;      // Taille buffer audio
const TARGET_SAMPLE_RATE = 16000;    // Deepgram attend 16kHz
const MAX_RECONNECT_ATTEMPTS = 2;   // Reconnexion auto WebSocket
```

### Formule de Calcul SPS Temps Réel

```typescript
// Filtre les mots dans la fenêtre glissante de 3s
const recentWords = wordTimestampsRef.current.filter(
  w => w.end >= (elapsedSeconds - SPS_WINDOW_SECONDS)
);

// Somme des syllabes dans la fenêtre
const syllablesInWindow = recentWords.reduce((sum, w) => sum + w.syllables, 0);

// Somme du temps d'articulation (PAS le temps total!)
const articulationTimeInWindow = recentWords.reduce((sum, w) => {
  const effectiveStart = Math.max(w.start, windowStart);
  const effectiveEnd = Math.min(w.end, elapsedSeconds);
  return sum + Math.max(0, effectiveEnd - effectiveStart);
}, 0);

// SPS = syllabes / temps articulation (minimum 0.15s pour éviter division par zéro)
const sps = articulationTimeInWindow > 0.15
  ? Math.round((syllablesInWindow / articulationTimeInWindow) * 10) / 10
  : 0;
```

### Fluency Ratio (Ratio de Fluence)

```typescript
// Pourcentage du temps passé à parler vs silences
fluencyRatio = totalArticulationTime / totalElapsedTime
// > 80% = Excellent, 60-80% = Normal, < 60% = À surveiller
```

---

## 🔤 Comptage des Syllabes Françaises

### Fichier `syllabify.ts` - Algorithme Optimisé

**1. Dictionnaire de 150+ mots français courants** avec comptage exact :
```typescript
const SYLLABLE_DICTIONARY: Record<string, number> = {
  // 1 syllabe (souvent sur-comptés)
  'je': 1, 'tu': 1, 'elle': 1, 'nous': 1, 'vous': 1, 'que': 1, 'qui': 1,
  'est': 1, 'sont': 1, 'fait': 1, 'mais': 1, 'dans': 1, 'pour': 1,
  
  // 2 syllabes
  'bonjour': 2, 'merci': 2, 'avec': 2, 'après': 2, 'toujours': 2,
  
  // 3+ syllabes (souvent mal comptés)
  "aujourd'hui": 3, 'absolument': 4, 'évidemment': 4,
  'particulièrement': 6, 'généralement': 5,
  
  // Contractions orales
  "j'suis": 1, "t'as": 1, "c'est": 1, "d'accord": 2,
  // ... 150+ mots
};
```

**2. Heuristique de Fallback** :

```typescript
function countSyllablesHeuristic(word: string): number {
  // Compte les groupes de voyelles
  const vowelGroups = word.match(/[aeiouyàâäéèêëïîôùûüœæ]+/gi) || [];
  let count = vowelGroups.length;
  
  // Gestion du 'e' muet final
  if (word.endsWith('e') && !/[aeiouy]/.test(word.slice(-2, -1))) {
    count = Math.max(1, count - 1);  // "table" = 1, pas 2
  }
  
  // Gestion du 'es' muet final
  if (word.endsWith('es') && !/[aeiouy]/.test(word.slice(-3, -2))) {
    count = Math.max(1, count - 1);  // "tables" = 1
  }
  
  // Gestion du 'ent' muet (3e personne pluriel verbes)
  if (word.endsWith('ent') && /[aeiouy]/.test(word.slice(-4, -3))) {
    count = Math.max(1, count - 1);  // "parlent" = 1, mais "parent" = 2
  }
  
  return Math.max(1, count);
}
```

---

## 🎨 Design System v3 — "Soft & Organique"

### Direction Artistique
Inspiré Headspace/Calm : formes arrondies, couleurs pastel chaleureuses, animations fluides et organiques. Ton rassurant et clinique sans être froid.

### Typographie
| Usage | Police | Poids |
|-------|--------|-------|
| **Titres (display)** | Nunito | 600-800 |
| **Corps (sans)** | DM Sans | 300-700 |
Chargées via Google Fonts dans `index.html` (preconnect + display=swap).

### Palette de Couleurs (Light)
| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 36 33% 97% | Fond crème chaud |
| `--foreground` | 230 18% 22% | Texte principal |
| `--card` | 40 40% 99% | Cards blanc crème |
| `--primary` | 170 45% 41% | Teal doux — CTA, accents |
| `--secondary` | 28 60% 95% | Blush chaud |
| `--muted` | 34 25% 93% | Fond sable |
| `--accent` | 22 75% 93% | Pêche lumineux |
| `--border` | 36 20% 88% | Bordures douces |

### Tokens de Feedback Clinique
| Token | HSL | Signification |
|-------|-----|---------------|
| `--speed-calm` | 160 50% 45% | Zone de confort |
| `--speed-fast` | 38 85% 55% | Attention |
| `--speed-critical` | 2 65% 55% | Trop rapide |
| `--success` | 160 50% 45% | Réussite |
| `--warning` | 38 85% 55% | Alerte |
| `--destructive` | 2 65% 55% | Erreur/danger |

### Radius & Ombres
- **Radius de base** : `--radius: 1.125rem` (généreux, organique)
- Variants : `sm` (-6px), `md` (-2px), `lg` (base), `xl` (+4px), `2xl` (+8px), `3xl` (1.75rem)
- **Ombres** : diffuses et teintées primary (`shadow-soft`, `shadow-glow`, `shadow-card`, `shadow-card-hover`)
- Card hover : lift de 3px + glow teal subtil

### Animations
| Classe | Effet | Durée |
|--------|-------|-------|
| `animate-fade-up` | Apparition + slide up | 0.6s ease-smooth |
| `animate-scale-in` | Scale de 94% à 100% | 0.4s ease-smooth |
| `animate-float` | Lévitation douce | 5s infinite |
| `animate-breathe` | Respiration (scale + opacity) | 6s infinite |
| `animate-blob` | Déformation organique | 8s infinite |
| `animate-shimmer` | Skeleton loading | 2s linear infinite |

Toutes les transitions utilisent `cubic-bezier(0.22, 1, 0.36, 1)` ("ease-smooth") pour un feeling organique.

### Utilities CSS Composants
| Classe | Description |
|--------|-------------|
| `.card-elevated` | Card avec shadow-card, hover lift 3px + glow |
| `.card-soft` | Card subtile, backdrop-blur, sans hover lift |
| `.glass` | Glassmorphism : bg-card/70, blur-2xl, border légère |
| `.gradient-text` | Texte dégradé primary → teal clair |
| `.gradient-subtle` | Fond dégradé background → secondary → accent |
| `.gradient-organic` | Fond organique multi-stops chaud |
| `.blob` | Border-radius organique (60% 40% 30% 70%) |
| `.interactive` | Transition douce hover scale 1.02, active 0.98 |
| `.badge-clinical` | Badge arrondi avec fond primary/10 |

### Timing Functions Tailwind
- `ease-smooth` : `cubic-bezier(0.22, 1, 0.36, 1)` — défaut organique
- `ease-bounce-sm` : `cubic-bezier(0.34, 1.56, 0.64, 1)` — rebond subtil
- `ease-organic` : `cubic-bezier(0.4, 0, 0.2, 1)` — naturel

---

## 🎯 Normes Van Zaalen par Âge

### `ageNormsUtils.ts` - Seuils Cliniques

```typescript
export const AGE_NORMS = {
  child: { maxAge: 12, targetSPS: 3.8, label: "Enfant" },
  adolescent: { minAge: 13, maxAge: 20, targetSPS: 5.2, label: "Adolescent" },
  adult: { minAge: 21, maxAge: 60, targetSPS: 4.3, label: "Adulte" },
  senior: { minAge: 61, targetSPS: 4.0, label: "Senior" }
};

// Fonction de calcul de l'âge et norme
export function getAgeNorm(birthYear: number | null): {
  ageGroup: string;
  targetSPS: number;
  warningThreshold: number;  // Alerte si débit > norme + 1.5 SPS
}
```

### Système de Niveaux (aligné SPS)

Le Niveau N correspond exactement à N syllabes par seconde (de 1 à 9). Les seuils de performance sont adaptatifs : la tolérance (marge d'erreur) est multipliée par un facteur d'échelle pour les vitesses lentes afin d'éviter des retours trop sévères.

Normes de référence : Adulte/Adolescent (5.0 SPS), Enfant (4.2), Senior (4.5).

En base de données, les valeurs sont stockées historiquement en WPM avec un coefficient de conversion de 1.8 syllabes par mot.

**Important** : La norme Van Zaalen est présentée comme une **référence indicative**, pas un objectif obligatoire. L'orthophoniste peut conseiller un objectif personnalisé (ex: vitesse habituelle − 1 syll/s). Le patient peut saisir manuellement une valeur libre dans les Réglages.

### Niveaux de Cibles Cliniques (1 à 9)

Les labels sont **neutres et non-jugeants** — un bredouilleur à 8 syll/s doit pouvoir cibler 7 sans que l'interface suggère que c'est "un challenge".

```typescript
export const SPS_TARGET_LEVELS = [
  { level: 1, sps: 1.0, label: "Très posé", emoji: "🐌" },
  { level: 2, sps: 2.0, label: "Posé", emoji: "🐢" },
  { level: 3, sps: 3.0, label: "Tranquille", emoji: "🎯" },
  { level: 4, sps: 4.0, label: "Modéré", emoji: "💬", recommended: true },
  { level: 5, sps: 5.0, label: "Courant", emoji: "🗣️" },
  { level: 6, sps: 6.0, label: "Soutenu", emoji: "📢" },
  { level: 7, sps: 7.0, label: "Dynamique", emoji: "💨" },
  { level: 8, sps: 8.0, label: "Vitesse haute", emoji: "🔷" },
  { level: 9, sps: 9.0, label: "Très rapide", emoji: "🔶" },
];
```

### Objectif personnalisé

- Le patient peut **saisir manuellement** une valeur SPS cible (ex: 6.5) dans les Réglages, en plus des presets
- Les pages Practice et Dialogue lisent le `target_wpm` sauvegardé en BDD et l'utilisent comme cible initiale
- Si aucun `target_wpm` n'est enregistré, fallback sur la norme d'âge Van Zaalen
- L'orthophoniste peut conseiller un objectif depuis la fiche patient (roadmap)

### Jauge de résultats relative

La jauge SpeedGaugeBar est **relative à l'objectif** (100% = cible atteinte), et non plus une échelle absolue 0-8. Les messages sont explicitement positifs pour les patients en-dessous de leur cible :
- Ratio < 0.5 → "Très posé" + "Vous ralentissez bien, c'est le but !"
- Ratio 0.5-0.8 → "Bien contrôlé" + "Bon contrôle du débit, continuez !"
- Ratio 0.8-1.0 → "Objectif atteint" + "Pile dans l'objectif, bravo !"
- Ratio > 1.0 → "Au-dessus" / "Trop vite"

---

## 🎨 Système de Feedback Visuel

### Zones SPS (`spsUtils.ts`)

```typescript
// Ratio-based zones (currentSPS / targetSPS)
export function getSPSZone(currentSPS: number, targetSPS: number) {
  const ratio = currentSPS / targetSPS;
  
  if (currentSPS === 0) return { zone: 'waiting', label: "Parlez..." };
  if (ratio < 0.5)      return { zone: 'too_slow', label: "Très posé", color: "blue" };
  if (ratio < 0.8)      return { zone: 'good', label: "Bien", color: "green" };
  if (ratio <= 1.2)     return { zone: 'perfect', label: "Parfait", color: "emerald" };
  if (ratio <= 1.5)     return { zone: 'warning', label: "Doucement...", color: "orange" };
  return { zone: 'danger', label: "Trop vite !", color: "red" };
}
```

### Seuils de Statut Clinique

```typescript
export function getDebitStatus(avgSps: number) {
  if (avgSps === 0)   return { label: "Non mesuré", color: "gray" };
  if (avgSps < 3.5)   return { label: "Débit lent", color: "green" };
  if (avgSps <= 5.5)  return { label: "Débit normo-fluent", color: "green" };
  if (avgSps <= 6.5)  return { label: "Débit rapide", color: "yellow" };
  return { label: "Tachylalie", color: "red" };
}
```

---

## 🔴 Analyse des Disfluences (Bêta)

### `analyzeDisfluency.ts` - Marqueurs Acoustiques

```typescript
export type DisfluencyType = 'repetition' | 'prolongation' | 'block' | 'syllabic_repetition';

export interface DisfluencyMarker {
  type: DisfluencyType;
  wordIndex: number;
  severity: 'mild' | 'moderate' | 'severe';
  duration?: number;
  word?: string;
  count?: number; // For repetitions: consecutive count
}

// Seuils de détection
const BLOCK_THRESHOLD = 2.0;        // Silence > 2 secondes = pause longue
const REPETITION_GAP = 0.2;         // Même mot répété < 0.2s = répétition
const PROLONGATION_DURATION = 0.8;  // Mot > 0.8 seconde = allongement
```

### Répétitions syllabiques partielles
Détection des mots tronqués répétés (ex: "pa-pa-papa", "je-je-je suis"). Logique : si deux mots consécutifs avec gap < 0.2s partagent le même préfixe (≥ 2 chars) et le premier est plus court, c'est une répétition syllabique. Marqueur type `syllabic_repetition`, affiché en souligné pointillé ambre 🟤.

### Score de régularité du débit (`speechRegularity.ts`)
Coefficient de Variation (CV = écart-type / moyenne) des durées inter-mots :
- 🟢 CV < 0.5 → "Régulier" — débit stable et fluide
- 🟡 CV 0.5–1.0 → "Variable" — alternance rapide/lent
- 🔴 CV > 1.0 → "Irrégulier" — montagnes russes

Gaps > 3s exclus du calcul (pauses de réflexion). Minimum 5 mots requis.

### Profil phonémique (`phonemeProfile.ts`)
Identifie les sons initiaux (phonèmes/digrammes français) où les disfluences se concentrent. Extrait le premier caractère ou digramme (ch, ph, tr, pr, bl, etc.) de chaque mot avec disfluence. Affiche un top 3 avec compteurs (ex: **P** ×4, **TR** ×2). **Réservé à la vue orthophoniste** — trop clinique pour le patient.

### Détection de tension vocale (`vocalTension.ts`)
Détecte les pics de volume soudains (< 20% → > 70% en < 200ms) — signe de blocage tonique avec explosion post-effort. Le hook `useVolumeAnalyzer` enregistre un historique de volume pour l'analyse post-session. Corrélation automatique avec les blocages détectés (tolérance ±0.5s).

### Détection des rafales / accélérations (`detectBursts`)
Identifie les segments où le SPS dépasse la cible de > 20% pendant > 3 secondes consécutives. Affichées comme bandes orangées semi-transparentes sur la courbe SPS. Label : "Accélération" (pas "Burst").

### Score de fluence (`calculateFluencyScore`)
Pourcentage de disfluences (markers + fillers) sur le total de mots :
- < 3% = Fluent
- 3-10% = Léger
- 10-20% = Modéré
- > 20% = Sévère

### Composant `TranscriptHeatmap.tsx`

Affiche le transcript avec coloration selon les disfluences :
- 🟠 **Orange** : Pauses longues (silences > 2s intra-phrase) — barre verticale + [⏸]
- 🟡 **Jaune** : Répétitions de mots (mots consécutifs identiques)
- 🟤 **Ambre pointillé** : Répétitions syllabiques (mots tronqués)
- 🟣 **Violet** : Allongements (durée > 0.8s)
- 🔵 **Bleu** : Mots d'appui (fillers)

**Prop `isTherapist`** : Contrôle la visibilité des sections cliniques avancées :
- **Patient** (`isTherapist=false`) : Score de fluence avec terminologie "hésitations", badges d'observations, transcript. Messages encourageants.
- **Ortho** (`isTherapist=true`) : Tout le contenu patient + score de régularité + profil phonémique + terminologie clinique ("disfluences", seuils en %).

**Disclaimer** : "Analyse acoustique (en test). Détecte les silences anormaux et les répétitions dans le signal audio, pas la tension musculaire."

### DAF Adaptatif (`useDAF.ts`)

Le hook DAF propose deux modes :
- **Manuel** : Délai fixe choisi par l'utilisateur (50-250ms)
- **Auto ✨** : Le délai s'adapte en temps réel selon le SPS :
  - SPS > cible × 1.2 → augmente de 10ms (max 250ms)
  - SPS ≤ cible → diminue de 10ms (min = base choisie par l'utilisateur)

Alimenté par `feedSPS()` appelé toutes les 500ms depuis Practice.tsx.
Le composant `DAFToggle.tsx` affiche un sélecteur Manuel/Auto et le délai actuel en temps réel.

---

## 🎮 Gamification

### Hook `useGamification.ts` - Logique des Streaks

```typescript
// Calcul de la série (streak)
const isToday = lastActivity && isSameDay(lastActivity, now);
const isYesterday = lastActivity && isSameDay(addDays(now, -1), lastActivity);

if (isToday) {
  // Même jour → ajoute minutes, garde streak
  newTodayMinutes += durationMinutes;
} else if (isYesterday) {
  // Jour consécutif → streak + 1
  newStreak += 1;
  newTodayMinutes = durationMinutes;
} else {
  // Gap > 1 jour → reset streak à 1
  newStreak = 1;
  newTodayMinutes = durationMinutes;
}

// Goal completion check
const wasGoalMet = todayMinutes >= dailyGoal;
const isGoalMetNow = newTodayMinutes >= dailyGoal;
const goalJustCompleted = !wasGoalMet && isGoalMetNow;  // Déclenche confetti
```

### Parcours Guidé (Duolingo-style)

Système de progression en **8 étapes** séquentielles, du plus simple au plus complexe. Chaque étape contient 3 exercices à valider (zone verte SPS) pour débloquer la suivante.

#### Étapes
| # | ID | Titre | Icône | Description |
|---|-----|-------|-------|-------------|
| 1 | `warmup` | Échauffement | 🏋️ | Déliez votre langue en douceur |
| 2 | `slow-reading` | Ralentir le débit | 🌱 | Apprenez à poser votre rythme |
| 3 | `breath-control` | Souffle & pauses | 🌬️ | Respirez pour mieux parler |
| 4 | `daily-life` | Vie quotidienne | 📧 | Transférez dans la vraie vie |
| 5 | `articulation` | Défis d'articulation | 👅 | Gagnez en précision |
| 6 | `improvisation` | Oral libre | 🎤 | Parlez sans filet |
| 7 | `cognitive-traps` | Pièges cognitifs | 🧠 | Gardez le cap sous pression |
| 8 | `retelling` | Récit résumé | 📖 | Synthétisez et racontez |

#### Architecture technique
- **Données** : `src/data/journeyPath.ts` définit les 8 `JourneyStep` avec `exerciseIds` et `requiredValidations`
- **Table DB** : `journey_progress` (user_id, step_index, exercise_id, session_id, validated_at)
- **Hook** : `useJourneyProgress.ts` — gère `currentStep`, `getValidatedExercises()`, `isStepUnlocked()`, `overallProgress`
- **Widget Dashboard** : `JourneyWidget.tsx` — barre de progression globale, bloc d'onboarding initial, CTA étape active, liste des étapes (verrouillées/complétées)
- **Profil** : `profiles.current_journey_step` synchronisé avec la progression

#### UX du parcours
1. **Dashboard** : Widget "Votre parcours" avec barre 1/8, texte dynamique ("Réussissez 3 exercices pour débloquer X")
2. **Lancement exercice** : URL `?journey_step=N` + header affichant "Étape N · Titre" + mini-barre de 8 points
3. **Résultat session** : Barre de progression spécifique à l'étape (ex: 2/3 réussis), bouton "Continuer le parcours"
4. **Déblocage** : Animation + texte explicite quand une nouvelle étape est débloquée
5. **Complétion** : Trophée 🏆 + message "Parcours terminé" + redirection vers mode libre

#### Coexistence avec le mode libre
Le "Mode libre" reste accessible depuis le widget via un bouton "Mode libre" → `/library`. Le parcours est la voie guidée recommandée, le mode libre est pour l'exploration autonome.

### Statuts de Rétention (pour orthophonistes)

```typescript
export type RetentionStatus = "active" | "slipping" | "dropout";

export function getRetentionStatus(daysSinceActivity: number): RetentionStatus {
  if (daysSinceActivity <= 2) return "active";   // ✅ Actif
  if (daysSinceActivity <= 5) return "slipping"; // ⚠️ En baisse
  return "dropout";                              // 🔴 Abandon
}
```

---

## 📚 Catégories d'Exercices

### 16+ Catégories Distinctes

| ID | Titre | Type | Description |
|----|-------|------|-------------|
| `dialogue` | Mode Dialogue | dialogue | Transfert en situation réelle, biofeedback émoji, sélection de thèmes (dont mode "Libre" sans questions), rotation de prompts avec bouton "Suivant" |
| `silence-training` | Tolérance au Silence | silence | Faux dialogue avec pauses imposées, countdown 3s, détection silence/parole, bilan avec waveform + timeline colorée, bouton skip question |
| `rebus-enfant` | Mode Enfants (Rébus) | rebus | 30+ exercices emoji pour non-lecteurs 4-7 ans |
| `slow-reading` | Ralentissement | reading | Phrases courtes avec pauses |
| `daily-life` | Vie quotidienne | reading | Emails, conversations réalistes |
| `articulation` | Défis d'articulation | reading | Virelangues, diction |
| `clinical-texts` | Textes Cliniques | reading | Textes validés scientifiquement |
| `warmup` | Gymnastique Articulatoire | warmup | Échauffement vocal |
| `improvisation` | Improvisation Guidée | improvisation | Parole spontanée sur thème, bouton "Question suivante" |
| `repetition` | Répétition Intensive | repetition | Mots/phrases répétés |
| `respiration` | Respiration & Pauses | reading | Focus sur le souffle |
| `narrative` | Narrations Longues | reading | Textes > 200 mots |
| `professional` | Communication Pro | reading | Présentations, réunions |
| `proprioception` | Auto-Contrôle | proprioception | Test sans biofeedback |
| `retelling` | Récit résumé | retelling | Écouter une histoire puis la résumer de mémoire |

### Mode Rébus (Enfant 4-7 ans)
- Exercices basés sur des séquences emoji avec labels texte
- TTS avec contrôle de vitesse 🐢 (0.4×) à 🐇 (1.0×)
- Pauses respiratoires visuelles (barres animées)
- Countdown 3-2-1 entre les répétitions ("Reprends ton souffle")
- Le temps de countdown est exclu du calcul SPS via `addPauseOffset(3000)`
- Modes Libre et Guidé (karaoké emoji par emoji)

### Mode Auto-Contrôle (Proprioception)

```typescript
// 3 niveaux de calibration spécifiques
const PROPRIOCEPTION_LEVELS = [
  { sps: 3.0, label: "Lent" },
  { sps: 4.0, label: "Modéré" },
  { sps: 5.0, label: "Rapide" },
];

// Thèmes d'improvisation concrets
const IMPROVISATION_THEMES = [
  "Décrivez votre maison ou appartement",
  "Racontez vos dernières vacances",
  "Expliquez votre routine matinale",
  "Décrivez votre plat préféré",
  "Parlez de votre métier ou études",
  // ... 10+ thèmes
];
```

---

## 🎵 Modes de Guidage

### 1. Mode Libre
- Lecture naturelle sans guidage visuel
- Tracking SPS uniquement
- Enregistrement audio pour réécoute

### 2. Mode Guidé (Karaoké)
- Surligneur bleu mot-par-mot
- Vitesse basée sur `target MPM = target SPS × 33.3`
- Pauses forcées après ponctuation : `,` = 400ms, `.!?` = 800ms
- Effet "Tunnel Vision" : mots futurs floutés

### 3. Mode Syllabique
- Syllabes françaises mises en évidence
- Intervalle de 600ms par syllabe
- Utilise `syllabifySentence()` de `syllabify.ts`

---

## 🎤 Biofeedback Temps Réel

### Composant `BiofeedbackBar.tsx`

**Stabilisation UX** :
- Debounce de **1.5 secondes** sur les changements de zone
- Seuil de silence de **0.3 SPS** avant d'afficher "Parlez..."
- Message d'attente initial : "Continuez à parler..." pendant les 2 premières secondes

**Éléments affichés** :
- `SpeedGaugeBar` : Barre colorée avec zone cible intégrée
- Emoji dynamique : 🐢 / ✅ / ⚡ selon la zone
- Label : "Rythme idéal", "Doucement...", "Trop vite !"
- SPS numérique (secondaire, plus petit)

### Mode Auto-Contrôle
- Remplace la jauge par une "Breathing Light" (pulsation)
- Aucun feedback numérique pendant l'exercice
- Révélation de la courbe uniquement à la fin

---

## 📈 Réécoute Augmentée & Waveform

### Composant `ClinicalWaveform.tsx`

**Architecture** : La courbe SPS est rendue dans un **panneau séparé sous le waveform** (et non en superposition) pour garantir un alignement temporel parfait malgré le zoom/défilement audio.

**Waveform (wavesurfer.js)** :
```typescript
const wavesurfer = WaveSurfer.create({
  container: waveformRef.current,
  waveColor: '#10b981',
  progressColor: '#059669',
  cursorColor: '#6366f1',
  height: 100,
  barWidth: 2,
  barGap: 1,
  normalize: true,
});
const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
```

**Courbe SPS synchronisée** :
- Graphique SVG distinct, synchronisé sur le même axe temporel que l'audio
- Code couleur clinique : Bleu (zone cible ≤5.5 SPS), Orange (rapide), Rouge (trop rapide)
- Ligne de cible pointillée + zone cible colorée
- Curseur temporel partagé avec le waveform
- Navigation interactive : clic sur le graphique SPS = saut dans l'audio (`onSeek`)
- Largeur détectée via **callback ref** + `ResizeObserver` (évite les problèmes de rendu conditionnel)
- Hauteur fixe de 120px avec `minHeight: 140px` sur le conteneur

**Fonctionnalités** :
- Click-to-seek sur waveform ET courbe SPS
- Zoom de 25% à 200%
- Annotation contextuelle (ex: "À 0:28 — accélération détectée")
- Light mode aesthetique (fond blanc, vagues emerald)

## 📖 Exercice Retelling (Récit résumé)

### Principe
Le patient écoute une histoire courte (TTS), puis la résume de mémoire. L'enregistrement audio est sauvegardé et analysé par l'IA (Gemini) sur plusieurs axes cliniques.

### Analyse IA (`analyze-retelling` edge function)
- **Points clés** : chaque point attendu est vérifié (trouvé/manquant + commentaire)
- **Concision** : concis / acceptable / digressif
- **Organisation** : logique / partiellement logique / désorganisé
- **Digressions** : liste des écarts narratifs détectés
- **Feedback global** : résumé encourageant en 2-3 phrases

### Persistance
L'analyse est sauvegardée dans `sessions.notes` au format JSON `{ retelling_analysis: {...} }`. Le `SessionDetail` détecte `exercise_type === "retelling"` et affiche le bilan complet (score, points clés, concision, organisation, digressions, feedback) à la place de l'analyse de fluence standard.

### Audio
L'audio est capturé via `MediaRecorder` et uploadé dans le bucket `recordings`. Il est lisible depuis le bilan immédiat (`RetellingBilan`) ET depuis le détail de session (`SessionDetail` via `ClinicalWaveform`).

---

## 🏷️ Labels d'exercices (`clinicalSummary.ts`)

Les sessions sont étiquetées selon leur `exercise_type` :
| `exercise_type` | Label affiché |
|-----------------|---------------|
| `reading` (défaut) | Lecture |
| `improvisation` | Oral libre |
| `dialogue` | Dialogue oral |
| `repetition` | Répétition |
| `warmup` | Échauffement |
| `live_session` | Session en séance |
| `neuro_projection` | Projection vocale |
| `retelling` | Récit résumé |
| `silence_training` | Tolérance au silence |
| `silence_training` | Tolérance au silence |

---

## 📄 Génération de Rapports PDF

### `ClinicalReportPDF.tsx`

**Contenu du rapport** :
- En-tête avec logo et informations patient
- Période d'analyse sélectionnable
- Statistiques clés : sessions, SPS moyen, évolution
- Graphique de progression (intégré en image)
- Notes cliniques (optionnelles)
- Disclaimer légal

**Options** :
- Période : 7, 30, 90 jours ou personnalisée
- Inclure notes privées : oui/non
- Inclure graphique : oui/non

---

## 💳 Intégration Stripe

### Edge Function `create-checkout-session`

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  customer: customerId,
  line_items: [{
    price: plan === 'yearly' ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID,
    quantity: 1,
  }],
  success_url: `${origin}/dashboard?payment=success`,
  cancel_url: `${origin}/pricing`,
  metadata: { user_id: userId, plan },
  subscription_data: {
    metadata: { user_id: userId },
  },
});
```

### Edge Function `stripe-webhook`

**Événements gérés** :
| Événement | Action |
|-----------|--------|
| `checkout.session.completed` | `is_premium = true`, `subscription_status = 'active'` + récompenses parrainage |
| `customer.subscription.updated` | Sync `subscription_status` |
| `customer.subscription.deleted` | `is_premium = false`, `subscription_status = 'canceled'` |
| `charge.refunded` | `is_premium = false` |
| `invoice.payment_failed` | Log pour investigation + email `payment_failed` |
| `invoice.payment_succeeded` | Confirmation dans logs + email avec lien facture |

**Récompenses parrainage automatiques** (dans `checkout.session.completed`) :
1. Détecte si l'utilisateur a un parrainage `pending` dans la table `referrals`
2. Crée un coupon Stripe 100% off / 1 mois pour le **parrain** et le **filleul**
3. Applique le coupon à l'abonnement actif (ou l'attache au customer si pas encore abonné)
4. Incrémente `referral_bonus_months` via RPC `increment_referral_bonus`
5. Met à jour `referrals.status = 'completed'` + `completed_at`
6. Envoie les emails `referral_completed` aux deux parties

**Signature verification** (Deno) :
```typescript
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  Deno.env.get('STRIPE_WEBHOOK_SECRET'),
  undefined,
  cryptoProvider
);
```

---

## 🔐 Sécurité & RLS

### Politiques RLS Principales

```sql
-- Profiles : lecture/écriture pour propriétaire
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions : propriétaire + thérapeute lié
CREATE POLICY "Users can read own sessions" ON sessions FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = sessions.user_id AND linked_therapist_id = auth.uid()
  ));

-- Clinical notes : thérapeute uniquement
CREATE POLICY "Therapist notes" ON clinical_notes 
  USING (auth.uid() = therapist_id);
```

---

## 🌐 Pages et Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | UnifiedLanding | Landing page unifiée (patients + orthophonistes) |
| `/patients` | PatientLanding | Landing dédiée patients |
| `/pro` | ProLanding | Page dédiée orthophonistes |
| `/pricing` | Pricing | Grille tarifaire |
| `/about` | About | Histoire du fondateur |
| `/blog` | Blog | Articles SEO |
| `/blog/:slug` | BlogArticle | Article détaillé |
| `/contact` | Contact | Formulaire de contact |
| `/auth` | Auth | Login/Signup |
| `/dashboard` | Dashboard | Dashboard patient |
| `/library` | Library | Bibliothèque d'exercices (supporte `?for_patient=ID` pour mode séance ortho) |
| `/practice` | Practice | Arène de pratique (détecte `for_patient` pour enregistrer dans le dossier patient) |
| `/dialogue` | Dialogue | Mode dialogue oral avec thèmes et biofeedback SPS |
| `/silence-training` | SilenceTraining | Tolérance au silence avec waveform + timeline |
| `/session/:id` | SessionDetail | Détail d'une session (réécoute augmentée) |
| `/session-live` | SessionLive | Mode séance live (débitmètre temps réel avec enregistrement audio) |
| `/patient/:id` | PatientDetail | Dossier patient (thérapeute) — bouton « S'exercer » avec tooltip |
| `/therapist` | TherapistDashboard | Dashboard orthophoniste |
| `/diagnostic` | Diagnostic | Test vocal gratuit 30s |
| `/settings` | Settings | Paramètres utilisateur |
| `/legal/terms` | Terms | CGV/CGU |
| `/legal/privacy` | Privacy | Politique de confidentialité |

---

## 📝 Conventions de Terminologie

### À éviter → À utiliser

| ❌ Éviter | ✅ Utiliser |
|----------|-------------|
| IA | Algorithme, Moteur d'analyse |
| Fillers, Mots parasites | Mots d'appui |
| AI feedback | Analyse automatique |
| Machine learning | Traitement du signal |
| Ortho | Orthophoniste |
| WPM | SPS (sauf dans code legacy) |
| Premium (côté patient) | Aucune mention - accès complet par défaut |
| mots/minute, WPM (affichage) | syllabes/seconde, syll./sec, SPS |
| Karaoké | Guidé, Guidage |
| Biofeedback | Retour visuel |
| Sessions | Séances |
| Bibliothèque | Vos exercices |
| Observance | S'entraîner entre les séances |
| Rapide / Challenge (labels vitesse) | Courant / Soutenu / Dynamique (labels neutres) |

---

## ⚠️ Disclaimers Légaux

L'application **n'est pas un dispositif médical** :
- Pas de diagnostic ni prescription
- Ne remplace pas une consultation orthophonique
- Données à titre indicatif uniquement
- POCLE décline toute responsabilité en cas d'absence de progrès

**Éditeur** : POCLE SAS, 21 B Rue du Simplon, 75018 Paris
**RCS** : Paris 847 536 711
**TVA** : FR70847536711

---

## 🔧 Mots-clés de Détection de Disfluences

```typescript
const FRENCH_FILLERS = [
  'euh', 'heu', 'hum',           // Hésitations vocales
  'ben', 'bah', 'bon',           // Interjections
  'du coup', 'en fait', 'genre', // Mots de liaison parasites
  'tu vois', 'alors', 'voilà',   // Ponctuants oraux
  'quoi'                         // Marqueur final
];
```

---

## 📊 Tooltips Cliniques Standardisés

```typescript
export const METRIC_TOOLTIPS = {
  SPS: "Syllabes par seconde - Calculé sur le temps de parole réel (silences exclus). Cible thérapeutique : 3.0-4.5 SPS",
  AVG_SPS: "Vitesse moyenne de la session. ≤4.0 = optimal, 4-5 = rapide, >5 = tachylalie",
  MAX_SPS: "Vitesse maximale atteinte. Un écart important avec la moyenne peut indiquer des accélérations involontaires",
  FLUENCY_RATIO: "Pourcentage du temps passé à parler vs silence. >80% = excellent, 60-80% = normal, <60% = à surveiller",
  FILLERS: "Disfluences détectées automatiquement pendant la session",
  SYLLABLES: "Nombre total de syllabes prononcées (algorithme optimisé français)",
};
```

---

## 🎯 Constantes Techniques Critiques

```typescript
// SPS
export const MAX_REALISTIC_SPS = 10.0;    // Maximum humain réaliste (étendu pour bredouilleurs rapides)
export const SPS_BUFFER_SIZE = 5;         // Taille buffer de lissage
export const SPS_THRESHOLDS = {
  optimal: 5.0,
  elevated: 6.0,
  tachylalia: 7.0,
};

// Deepgram
const WS_URL = 'wss://api.deepgram.com/v1/listen?model=nova-2&language=fr&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000';

// Gamification
const DEFAULT_DAILY_GOAL = 3;  // 3 minutes par défaut

// Mode Guidé (Karaoké)
const PAUSE_COMMA = 400;       // ms après virgule
const PAUSE_PERIOD = 800;      // ms après point
const SYLLABLE_INTERVAL = 600; // ms entre syllabes (mode syllabique)
```

---

## 🔄 Conversion WPM ↔ SPS

Pour compatibilité avec données legacy :

```typescript
// WPM vers SPS
export const wpmToSps = (wpm: number): number => {
  return Math.round((wpm * 1.8 / 60) * 10) / 10;
  // Ex: 120 WPM → 3.6 SPS
};

// SPS vers WPM
export const spsToWpm = (sps: number): number => {
  return Math.round(sps * 60 / 1.8);
  // Ex: 4.0 SPS → 133 WPM
};

// Moyenne : 1 mot français ≈ 1.8 syllabes
```

---

## 📋 Copie Presse-Papiers Robuste

### Fonction `handleShare` (`SessionDetail.tsx`)

```typescript
// Méthode moderne avec fallback
try {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(shareText);
  } else {
    // Fallback : textarea temporaire + execCommand
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  toast.success("Résumé copié");
} catch (error) {
  console.error("Erreur de copie:", error);
  toast.error("Impossible de copier...");
}
```

**Compatibilité** : Fonctionne sur tous les navigateurs, contextes sécurisés/non-sécurisés.

---

## 📱 Responsive & Accessibilité

- Mobile-first avec breakpoints Tailwind standards
- Dark mode complet (next-themes)
- Contraste WCAG AA minimum
- Focus visible sur éléments interactifs
- Labels ARIA pour lecteurs d'écran
- **MetricTooltip** : utilise `Popover` (pas `Tooltip`) pour fonctionner au tap sur mobile ET au hover sur desktop
- Boutons d'action sur PatientDetail : `size="sm"` + conteneur scrollable horizontal (`overflow-x-auto`, `shrink-0`)
- Bouton « S'exercer » : tooltip shadcn expliquant que la séance sera enregistrée dans le dossier patient
- Bibliothèque en mode patient (`?for_patient=ID`) : bannière « Mode séance » avec sous-texte explicatif
- Practice en mode patient : bandeau « Exercice pour [Nom] » + désactivation gamification/streaks

---

## 🏥 Mode "S'exercer pour un patient" (Ortho)

### Flux complet
1. **Fiche patient** (`/patient/:id`) → bouton « S'exercer » avec tooltip explicatif
2. **Bibliothèque** (`/library?for_patient=ID`) → bannière « Mode séance » (pas « Mode découverte »)
3. **Exercice** (`/practice?for_patient=ID`) → bandeau « Exercice pour [Nom] »
4. **Navigation retour** (flèche ←) → préserve `for_patient` dans l'URL pour maintenir le contexte
5. **Enregistrement** → session sauvegardée dans le dossier du patient (pas de l'ortho)

### Règles UX
- **Gamification désactivée** : pas de streaks/XP pendant une séance patient
- **Calibration patient** : utilise le `birth_year` et `target_wpm` du patient (pas de l'ortho)
- **Bannière Mode découverte** : apparaît UNIQUEMENT quand un ortho explore sans `for_patient`, avec texte invitant à utiliser le bouton « S'exercer » depuis la fiche patient
- **`useSearchParams`** : obligatoire (pas `new URLSearchParams(window.location.search)`) pour détecter dynamiquement `for_patient` même après navigation React

---

## 📊 Filtres temporels sur les courbes de progression

Les graphiques de vitesse de parole (côté patient `PatientProgressCard` et côté ortho `PatientEvolutionChart`) proposent un filtre par période : **7j · 30j · 3 mois · Tout**. Les KPIs (moyenne SPS, % dans la cible) et le badge de tendance se recalculent dynamiquement selon la période sélectionnée. Le filtre est aussi visible en état vide (< 2 sessions) pour que l'utilisateur comprenne qu'il peut changer de période. La courbe de progression côté ortho filtre les sessions à 0 SPS, affiche une cible dynamique basée sur le `target_wpm` du patient, et utilise un domaine Y [2, 8] pour une meilleure granularité.

---

## 📧 Cycle de Vie Email

### Templates Disponibles

| Template | Déclencheur | Audience |
|----------|-------------|----------|
| `welcome-patient` | Inscription (détecte `isSolo`) | Patients B2B + B2C |
| `welcome-therapist` | Inscription orthophoniste | Thérapeutes |
| `first-win` | 1ère session complétée | Tous patients |
| `patient-joined` | Patient lie son Code Pro | Thérapeutes |
| `patient-archived` | Patient archivé par ortho | Patients B2B |
| `inactivity-reminder` | 5+ jours sans activité (cooldown 7j) | Patients actifs |
| `weekly-report` | Dimanche soir (cron) | Patients actifs non-archivés |
| `trial-expiring` | J-3 avant fin essai B2B | Thérapeutes |
| `b2c_trial_expiring` | J-2 avant fin essai solo (±1j) | Patients B2C |
| `subscription-expiring` | Abonnement expirant | Thérapeutes |
| `subscription-confirmed` | Paiement Stripe confirmé | Abonnés |
| `subscription-canceled` | Résiliation Stripe | Abonnés |
| `payment-failed` | Échec de paiement | Abonnés |
| `refund-confirmation` | Remboursement Stripe | Abonnés |
| `trial-extended` | Essai prolongé manuellement | Thérapeutes/Patients |
| `therapist-expiring-patient` | Ortho expire → alerte patient | Patients B2B |
| `therapist-no-patient` | Ortho sans patient après 5j | Thérapeutes |
| `prescription-assigned` | Exercice prescrit par ortho | Patients B2B |
| `referral-applied` | Code parrain saisi (2 versions : parrain + filleul) | Parrain & Filleul |
| `referral-completed` | Filleul paye → coupon activé | Parrain |
| `newsletter-ortho-v1` | Newsletter manuelle #1 | Thérapeutes |
| `newsletter-ortho-v2` | Newsletter manuelle #2 | Thérapeutes |
| `trial-bug-apology` | Excuse bug essai (one-shot) | Thérapeutes impactés |
| `admin-weekly-digest` | Digest admin hebdo | Admin |

### Logique Cron (`scheduled-emails`)
- **Quotidien** : relances inactivité (cooldown `last_engagement_email_at` 7j), fins d'essai B2B (J-3) et B2C (J-2)
- **Dimanche** : bilan hebdomadaire SPS aux patients actifs (< 7j d'inactivité, non archivés)
- **B2C trial** : requête solo = `linked_therapist_id IS NULL AND is_therapist = false AND trial_end_date BETWEEN now()+1j AND now()+3j`

---

## 🤝 Système de Parrainage

### Principe
Chaque utilisateur (orthophoniste ou patient) reçoit automatiquement un `referral_code` unique (format `REF-XXXXXX`) à la création de son profil via un trigger PostgreSQL (`generate_referral_code`).

### Flux Complet

1. **Parrain partage son code** : visible dans `ReferralCard` sur le dashboard orthophoniste (section "Parrainage" avec bouton copier)
2. **Filleul saisit le code** : champ dédié dans la même section, fonctionne même après inscription
3. **Création du parrainage** : entrée `referrals` avec `status = 'pending'`
4. **Emails de notification** : `referral_applied` envoyé au parrain (via edge function `notify-referral-applied`) ET au filleul
5. **Premier paiement du filleul** : le webhook Stripe (`checkout.session.completed`) détecte le parrainage `pending`
6. **Récompense automatique** : coupon Stripe 100% off 1 mois créé et appliqué aux deux parties
7. **Email de confirmation** : `referral_completed` envoyé au parrain

### Statut "En attente" pendant l'essai
Le parrainage reste `pending` tant que le filleul n'a pas souscrit à un abonnement payant. **C'est le comportement normal** — le mois gratuit ne s'active qu'après le premier paiement. Les cartes de parrainage (patient `PatientReferralCard` et ortho `ReferralCard`) affichent un compteur "En attente" (ambre) avec un message explicatif : "Le mois gratuit s'active dès que votre filleul(e) passe à l'abonnement payant après son essai gratuit."

### Table `referrals`
| Colonne | Description |
|---------|-------------|
| `referrer_id` | UUID du parrain |
| `referred_id` | UUID du filleul (unique constraint) |
| `status` | `pending` → `completed` |
| `referrer_rewarded` | Boolean, true quand coupon appliqué |
| `referred_rewarded` | Boolean, true quand coupon appliqué |
| `completed_at` | Timestamp de validation |

### Profil (`profiles`)
| Colonne | Description |
|---------|-------------|
| `referral_code` | Code unique `REF-XXXXXX` (auto-généré) |
| `referral_bonus_months` | Compteur de mois bonus accumulés |

### UI (`ReferralCard.tsx` et `PatientReferralCard.tsx`)
- Compteurs visuels : "En attente" (ambre), "Validés" (primary), "Mois gagnés"
- Bannière explicative ambre quand des parrainages sont en attente
- Section FAQ intégrée expliquant : parrainage croisé, cumul sans limite, fonctionnement pendant essai
- Distinction claire : "Votre code parrain" (à partager) vs "Entrer un code" (à saisir)
- Message explicite : le code peut être saisi **après** inscription

---


---

## 🎉 Onboarding & Effet "Wahou"

### Écrans de Bienvenue (Slide 0)
Les modaux d'onboarding (Patient via `PatientWelcomeModal` et Orthophoniste via `WelcomeTourModal`) incluent un écran de bienvenue célébrant l'arrivée de l'utilisateur :
- **Confettis** : `canvas-confetti` déclenché une seule fois à l'ouverture (via `useRef` guard)
- **Emojis animés** : entrée spring staggerée (🎉 🩺 📊 pour ortho, 🎉 🗣️ 🎯 pour patient)
- **Personnalisation** : prénom du patient affiché si disponible
- **Tour guidé ortho** : 6 slides (Code Pro, patients, suivi, alertes, rapports)

### Déclenchement
- Patient : `!is_therapist && !onboarding_completed_at && isNewAccount` → modal avec delay
- Ortho : `is_therapist && !onboarding_completed_at` → `WelcomeTourModal`
- Marqué complété via `onboarding_completed_at` en base

---

## 📧 Contact & Communication

- **Email de contact unique** : `contact@parlermoinsvite.fr` (utilisé partout : emails, newsletters, templates, footer)
- **Téléphone** : 06 98 42 54 43
- **Ne jamais utiliser** : `clement@parlermoinsvite.fr` ou toute autre variante

---

## 🐛 Bug Fix : Courbe SPS plate (ClinicalWaveform)

### Cause racine (corrigé 26/03/2026)
Les `wpm_data` stockées en base utilisaient l'**index du tableau** comme `timestamp` (0, 1, 2, 3...) au lieu des vrais temps en secondes. L'échantillonnage est ~500ms, donc une session de 147s avec 38 points avait des timestamps 0→37. Le `SpsChart` utilisait `d.time / duration` pour positionner les points → tous compressés dans le premier quart, puis ligne plate sur le reste.

### Corrections
1. **`SpsChart` (affichage)** : détecte les anciennes données mal horodatées (`lastTimestamp < duration * 0.5`) et redistribue les points uniformément → **corrige toutes les sessions existantes**
2. **`Practice.tsx` / `Dialogue.tsx` / `SessionLive.tsx` (collecte)** : calcule `intervalSec = elapsedTime / (points - 1)` et stocke `timestamp = Math.round(i * intervalSec)` → les nouvelles sessions ont des vrais timestamps

### Fichiers impactés
- `src/components/clinical/ClinicalWaveform.tsx` (SpsChart)
- `src/pages/Practice.tsx`
- `src/pages/Dialogue.tsx`
- `src/pages/SessionLive.tsx`

---

## 🚀 Leviers de Conversion & Croissance (ajouté 27/03/2026)

### 1. Onboarding guidé "3 actions clés"
- **Composant** : `src/components/pro/OnboardingChecklist.tsx`
- Affiche une checklist sur le dashboard ortho avec 3 étapes : inviter un patient, assigner un exercice, consulter un bilan
- Se masque automatiquement 5s après complétion des 3 étapes
- Barre de progression visuelle, collapsible

### 2. Bandeau de conversion intelligent (TrialBanner)
- **Props ajoutées** : `activePatients`, `totalSessions`
- En dessous de 7 jours restants, affiche : "3 patients actifs, 12 séances enregistrées — ne perdez pas ces données"
- Ancre la valeur accumulée plutôt qu'un simple compte à rebours

### 3. Email "moment magique" (première séance patient)
- **Edge Function** : `supabase/functions/notify-magic-moment/index.ts`
- **Template** : `supabase/functions/send-email/_templates/patient-first-session.tsx`
- Déclenché automatiquement dans `Practice.tsx` quand le 1er exercice d'un patient lié à un ortho est enregistré
- Contient un lien direct vers le détail du patient + conseil d'encouragement

### 4. Bouton "Recommander à un(e) collègue"
- **Composant** : `src/components/pro/RecommendButton.tsx`
- Dropdown avec 3 options : WhatsApp, Email, Copier le message
- Message pré-rédigé avec lien de parrainage et argument "1 mois offert"
- Affiché dans le header du dashboard ortho (à côté du bouton Settings)

### 5. Suivi bilan consulté (localStorage)
- `PatientDetail.tsx` set `pro_viewed_bilan = true` dans localStorage
- Utilisé par OnboardingChecklist pour marquer l'étape "Consulter un bilan" comme faite

---

## 🔧 Prescriptions d'exercices spéciaux

Les exercices "Mode Dialogue" et "Tolérance au Silence" sont des cartes spéciales dans la bibliothèque (pas des catégories standard). Ils disposent chacun d'un bouton "Prescrire" visible uniquement par les orthophonistes (`isTherapist`), au même titre que les catégories standard. Les IDs de prescription sont respectivement `dialogue` et `silence-training`.

---

## 🏥 Bilan Bredouillement (Batterie Van Zaalen)

### Vue d'ensemble
Outil d'évaluation clinique automatisé réservé aux orthophonistes, basé sur la batterie Van Zaalen (2018). Wizard en 8 étapes avec **pré-remplissage automatique** et **réécoute audio** intégrée.

### Étapes du bilan
| # | Étape | Rôle | Description |
|---|-------|------|-------------|
| 1 | Questionnaire PCI | Ortho | 18 items Likert (1-4), score /72, gate d'arrêt anticipé |
| 2 | Parole spontanée | Patient | Enregistrement 2 min sur thème imposé |
| 3 | Motricité orale (OMAS) | Ortho | 11 items cotés 0-2 |
| 4 | Encodage phonologique (SPA) | Patient | Affichage 5s → disparition → restitution |
| 5 | Épreuve prédictive | Patient | Items rappelés avec chronomètre |
| 6 | Reformulation | Patient | Écoute audio → résumé de mémoire |
| 7 | Lecture | Patient | Texte de Maupassant, VA + disfluences |
| 8 | Écriture | Patient | Description libre 3 min |

### Moteur d'analyse unifié
Le bilan utilise **exactement le même moteur** que le reste du site :

| Module | Rôle dans le bilan |
|--------|-------------------|
| `syllabify.ts` | Comptage syllabique précis (dictionnaire 150+ mots + heuristique) |
| `speechRateTimeline.ts` | VA par fenêtre glissante 1.6s, parole effective uniquement (silences exclus) |
| `computeSpeechRateMetrics` | Calcul de l'effectiveSPS avec compression boost |
| `analyzeDisfluency.ts` | Détection répétitions, prolongations, blocages, répétitions syllabiques |
| `clutteringProfile.ts` | Scoring de sévérité /10, bursts, déficit de pauses, télescopage |
| Deepgram Nova-2 | Transcription + word timestamps (même API que Practice/Dialogue) |

### Pipeline d'analyse (`batteryDisfluencyDetection.ts`)

```
Audio blob → Deepgram REST API → Word timestamps
  → countSyllablesWord() (syllabify.ts) pour chaque mot
  → analyzeDisfluency() → mapping Van Zaalen (8 catégories)
  → buildSpeechRateTimeline() → 5 échantillons VA
  → computeSpeechRateMetrics() → VA globale (parole effective)
  → analyzeClutteringProfile() → scoring sévérité
```

### Catégories de disfluences (Van Zaalen)
| Catégorie | Clé | Type |
|-----------|-----|------|
| Répétition de mots | `word_repetition` | Normal |
| Interjections | `segment_interjection` | Normal |
| Erreurs de pause | `pause_error` | Normal |
| Télescopages | `telescopage` | Bredouillement |
| Erreurs syntaxiques | `syntax_error` | Bredouillement |
| Répétitions tendues | `tense_word_repetition` | Bègue |
| Prolongations | `prolongation` | Bègue |
| Blocages | `blocage` | Bègue |

### Pré-remplissage automatique
Après chaque enregistrement :
- **VA** : 5 échantillons extraits de la timeline (médiane par segment)
- **Variabilité** : max - min des échantillons non-nuls
- **Disfluences** : comptées automatiquement par type (🤖 indicateur visuel)
- **Syllabes** : comptées via `syllabify.ts` (pas estimation brute)

L'ortho peut **ajuster** toutes les valeurs pré-remplies après réécoute.

### Réécoute audio
- Composant `AudioPlayerWaveform.tsx` (wavesurfer.js, cohérent avec le reste du site)
- Chaque étape avec enregistrement produit un `audioBlob`
- Upload vers `supabase.storage` bucket `recordings` (path: `battery/{assessmentId}/{stepName}`)
- URLs publiques transmises à `BatteryResults.tsx` pour réécoute

### Normes d'étalonnage
- Population : N=61, seuil ±1.25 ET
- VA lecture adulte : 5.58 ± 0.98 SPS
- VA parole spontanée adulte : 5.16 ± 0.83 SPS
- Score PCI : seuil de gate ≥ 28/72

### Rapport PDF
- Généré via `@react-pdf/renderer` (`BatteryReportPDF.tsx`)
- Comparaison automatique aux normes avec indicateur visuel (✓/⚠/✗)
- Sections : identification patient, résultats par épreuve, profil de disfluences, conclusion

### UX Ortho vs Patient
- Badges de rôle par étape (🔵 Ortho, 🟢 Patient, 🟣 Guidé)
- Consigne contextuelle ("Tournez l'écran vers le patient")
- Compteur d'étapes (1/8) dans le bandeau supérieur
- Sauvegarde automatique à chaque passage d'étape

---

*Document mis à jour le 10/04/2026 - Version 4.0*
