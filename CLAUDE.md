# CLAUDE.md — respirfacile

> Instructions pour Claude Code. Lis ce fichier EN ENTIER avant de toucher quoi que ce soit.

---

## 🎯 C'EST QUOI CE PROJET

**respirfacile** = app web pour patients SAOS (apnée du sommeil) et TMOF (thérapie myofonctionnelle orofaciale).
Modèle B2B : l'orthophoniste/kiné paie un abonnement → ses patients accèdent gratuitement via un code Pro.

**Fork de parlermoinsvite** (app fluence de la parole) — même stack, même architecture Supabase, refactored pour la respiration.

**URL cible** : respirfacile.fr (domaine à confirmer)

---

## 🛠️ STACK TECHNIQUE

```
React 18 + Vite + TypeScript
Supabase (Auth + PostgreSQL + Edge Functions + Storage + RLS)
react-router-dom v6 (PAS Next.js, PAS App Router)
Shadcn/ui + Radix UI + Tailwind CSS v3
react-hook-form + zod
@tanstack/react-query v5
recharts (graphiques progression)
framer-motion (animations)
wavesurfer.js (visualisation audio optionnelle)
canvas-confetti (célébrations)
sonner (toasts)
@react-pdf/renderer (bilans PDF)
Vitest + @testing-library/react (tests unitaires)
```

---

## 📁 STRUCTURE DU PROJET

```
respirfacile/
├── CLAUDE.md                    ← CE FICHIER
├── src/
│   ├── main.tsx                 ← Point d'entrée
│   ├── App.tsx                  ← Router principal
│   ├── index.css                ← Tailwind base
│   ├── contexts/
│   │   ├── AuthContext.tsx      ← Auth Supabase (à refactorer)
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── UnifiedLanding.tsx   ← Landing page principale → garder, refactorer contenu
│   │   ├── Auth.tsx             ← Login/Register → garder
│   │   ├── Dashboard.tsx        ← Patient dashboard → refactorer
│   │   ├── TherapistDashboard.tsx → garder, refactorer
│   │   ├── PatientDetail.tsx    → garder, refactorer
│   │   ├── SessionLive.tsx      ← Séance en temps réel → REFACTORER COMPLÈTEMENT
│   │   ├── SessionDetail.tsx    → garder, refactorer
│   │   ├── Practice.tsx         ← Exercices → REFACTORER
│   │   ├── Pricing.tsx          → garder, adapter tarifs
│   │   ├── Settings.tsx         → garder
│   │   ├── ProLanding.tsx       → garder, adapter texte
│   │   └── [autres pages PMV]   → adapter ou supprimer
│   ├── components/
│   │   ├── ui/                  ← Shadcn/ui — NE PAS TOUCHER
│   │   ├── landing/             → refactorer contenu
│   │   ├── dashboard/           → refactorer
│   │   ├── practice/            → REMPLACER par exercices respiration
│   │   ├── pro/                 → garder, adapter
│   │   └── [autres]
│   ├── hooks/                   → garder la plupart, adapter
│   ├── lib/
│   │   └── supabase.ts          ← Client Supabase
│   ├── data/                    ← Données statiques exercices PMV → REMPLACER
│   └── integrations/
│       └── supabase/
│           └── types.ts         ← Types DB générés → RÉGÉNÉRER après migrations
├── supabase/
│   ├── config.toml
│   ├── migrations/              ← Migrations SQL → NOUVELLES à créer
│   └── functions/               ← Edge Functions → adapter
├── public/
├── index.html                   → changer titre/favicon
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ SCHÉMA BASE DE DONNÉES

### Tables existantes (héritées de PMV — à MIGRER)

```sql
-- profiles (utilisateurs)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('patient', 'therapist', 'admin', 'solo_patient', 'kine')),
  therapist_code TEXT UNIQUE,         -- code PRO-XXXXXX pour les orthos/kinés
  subscription_status TEXT,           -- 'trialing' | 'active' | 'canceled' | 'past_due'
  subscription_tier TEXT,             -- 'starter' | 'pro' | 'cabinet'
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- therapist_patients (lien ortho → patient)
CREATE TABLE therapist_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES profiles(id),
  patient_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sessions (séances réalisées)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  therapist_id UUID REFERENCES profiles(id),
  exercise_id TEXT NOT NULL,
  duration_seconds INTEGER,
  metrics JSONB,                      -- données brutes de la séance
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nouvelles tables RESPIRFACILE

```sql
-- programmes thérapeutiques
CREATE TABLE patient_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id),
  therapist_id UUID REFERENCES profiles(id),
  profile_type TEXT CHECK (profile_type IN (
    'adult_saos_mild',      -- SAOS léger/modéré, adulte
    'adult_saos_severe',    -- SAOS sévère + appareillage
    'adult_tmof',           -- TMOF pure (rééducation oro-faciale)
    'adult_mixed',          -- SAOS + TMOF combiné
    'child_7_12',           -- Post-MVP
    'child_2_6'             -- Post-MVP
  )),
  week_number INTEGER DEFAULT 1,
  jokers_used INTEGER DEFAULT 0,
  jokers_reset_at DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- consentements parentaux (Post-MVP)
CREATE TABLE parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id),
  guardian_email TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- emails transactionnels (log)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);
```

### Fonction SQL utile

```sql
-- Reset hebdomadaire des jokers (à appeler via cron ou Edge Function)
CREATE OR REPLACE FUNCTION reset_weekly_jokers()
RETURNS void AS $$
  UPDATE patient_programs
  SET jokers_used = 0, jokers_reset_at = CURRENT_DATE
  WHERE jokers_reset_at < CURRENT_DATE - INTERVAL '7 days'
    OR jokers_reset_at IS NULL;
$$ LANGUAGE sql;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

**TOUTES les tables médicales ont RLS activé.**

Règles clés :
- Patient voit uniquement ses propres données (`user_id = auth.uid()`)
- Thérapeute voit les données de SES patients uniquement (via `therapist_patients`)
- Admin voit tout
- Jamais de données cross-patient sans vérification

```sql
-- Exemple RLS sur sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_own_sessions" ON sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "therapist_patient_sessions" ON sessions
  FOR SELECT USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = sessions.user_id
    )
  );
```

---

## 💰 TARIFICATION

| Plan | Prix | Patients max | Cible |
|------|------|-------------|-------|
| Starter | 15€/mois | 5 patients | Ortho débutante |
| Pro | 30€/mois | 20 patients | Ortho active |
| Cabinet | 55€/mois | illimité | Cabinet multi-praticiens |

**Essai** : 30 jours gratuit, SANS CB (SetupIntent Stripe → CB demandée à expiration).

### Flow Stripe (CRITIQUE)

```typescript
// Signup ortho → trial 30j sans CB
const { data: intent } = await supabase.functions.invoke('create-setup-intent', {
  body: { therapist_id: user.id }
})
// SetupIntent créé, CB demandée seulement à J30
// Si pas de CB à J30 → subscription canceled automatiquement
```

---

## 🏋️ CATALOGUE D'EXERCICES RESPIRFACILE

### Catégories principales

```typescript
type ExerciseCategory =
  | 'pause_controlee'      // Pause Contrôlée (= BOLT adapté, ne pas dire BOLT aux orthos)
  | 'cohérence_cardiaque'  // 5-5 ou 4-6 breathing
  | 'respiration_nasale'   // Rééducation nasale
  | 'myofonctionnel'       // Exercices lingua/lèvres/palais mou
  | 'diaphragmatique'      // Respiration abdominale
  | 'relaxation'           // Exercices de détente

type Exercise = {
  id: string
  category: ExerciseCategory
  name_fr: string
  duration_seconds: number
  sets?: number
  difficulty: 1 | 2 | 3
  contraindications?: string[]  // ex: ['SAOS_severe', 'grossesse']
  instructions_fr: string[]
  metrics_tracked: MetricKey[]
  target_profile: PatientProfileType[]
}
```

### Exercices MVP (Phase S1-S2)

```typescript
const EXERCISES: Exercise[] = [
  // --- PAUSE CONTRÔLÉE ---
  {
    id: 'pause_controlee_decouverte',
    category: 'pause_controlee',
    name_fr: 'Découverte de la pause',
    duration_seconds: 300,
    difficulty: 1,
    instructions_fr: [
      'Inspirez normalement par le nez',
      'Expirez doucement',
      'Pincez le nez et retenez le souffle',
      'Marchez lentement jusqu\'au premier signal d\'inconfort',
      'Notez le nombre de pas (= votre score)'
    ],
    metrics_tracked: ['pause_steps', 'pause_score'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed']
  },
  {
    id: 'pause_20',
    category: 'pause_controlee',
    name_fr: 'Pause 20 secondes',
    duration_seconds: 600,
    difficulty: 2,
    instructions_fr: ['Objectif : tenir 20 secondes de pause confortable'],
    metrics_tracked: ['pause_duration', 'comfort_level'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed']
  },
  {
    id: 'pause_25',
    category: 'pause_controlee',
    name_fr: 'Pause 25 secondes',
    duration_seconds: 600,
    difficulty: 3,
    instructions_fr: ['Objectif : tenir 25 secondes de pause confortable'],
    metrics_tracked: ['pause_duration', 'comfort_level'],
    target_profile: ['adult_saos_mild', 'adult_mixed']
  },
  // --- COHÉRENCE CARDIAQUE ---
  {
    id: 'coherence_5_5',
    category: 'cohérence_cardiaque',
    name_fr: 'Cohérence cardiaque 5-5',
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    instructions_fr: [
      'Inspirez 5 secondes par le nez',
      'Expirez 5 secondes par le nez ou la bouche',
      'Répétez 5 minutes, 3x/jour'
    ],
    metrics_tracked: ['cycles_completed', 'regularity_score'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed']
  },
  // --- MYOFONCTIONNEL ---
  {
    id: 'langue_palais',
    category: 'myofonctionnel',
    name_fr: 'Langue au palais',
    duration_seconds: 120,
    difficulty: 1,
    instructions_fr: [
      'Placez la pointe de la langue contre le palais dur',
      'Maintenez 2 minutes, bouche fermée, respiration nasale'
    ],
    metrics_tracked: ['hold_duration'],
    target_profile: ['adult_tmof', 'adult_mixed']
  },
  {
    id: 'nasale_guerrier',
    category: 'respiration_nasale',
    name_fr: 'Respiration nasale du guerrier',
    duration_seconds: 180,
    difficulty: 2,
    instructions_fr: [
      'Marchez en respirant exclusivement par le nez',
      'Si besoin de souffler par la bouche, ralentissez le pas',
      'Objectif : 3 minutes sans bouche'
    ],
    metrics_tracked: ['duration_nasal_only'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed']
  }
]
```

---

## 🧑‍⚕️ PROFILS PATIENTS

### MVP (Phase 1 = adultes uniquement)

| Profile ID | Description | Exercices prioritaires |
|-----------|-------------|----------------------|
| `adult_saos_mild` | SAOS léger/modéré, pas d'appareillage ou CPAP partiel | Pause contrôlée + cohérence + nasale |
| `adult_saos_severe` | SAOS sévère, sous CPAP — exercices complémentaires | Cohérence + myofonctionnel (PAS pause contrôlée seule) |
| `adult_tmof` | TMOF pure, pas de SAOS diagnostiqué | Myofonctionnel + nasale + pause |
| `adult_mixed` | SAOS + TMOF (cas fréquent) | Programme complet |

### Post-MVP

- `child_7_12` : enfants scolaires, avec accord parental
- `child_2_6` : jeunes enfants, mode pédiatrique (emojis)

---

## ⚠️ CONTRAINTES MÉDICALES NON-NÉGOCIABLES

Ces règles viennent du terrain (feedback Mathilde, ortho, Avril 2026) :

1. **Ne jamais dire "BOLT"** aux utilisateurs finaux — inconnu des orthos FR. Dire "Pause Contrôlée" ou "Test de Tolérance CO2".
2. **Ne jamais promettre de guérison** du SAOS — mention obligatoire "complément de traitement".
3. **Pas d'exercice de pause contrôlée sans consentement** pour SAOS sévère (risque hypoxie).
4. **Score de la pause = nombre de pas en apnée** — NE PAS afficher en secondes seules (déroute les patients).
5. **Séances max 20 min/jour** — au-delà = contre-productif (hyperventilation compensatoire).
6. **Pas de gamification aggressive** sur exercices thérapeutiques — pas de streak punitif, jokers obligatoires (2/semaine).
7. **Les orthos veulent exporter en PDF** les bilans patients — fonctionnalité non-négociable S2.
8. **Partage audio avec l'ortho** — enregistrement séance optionnel, stocké Supabase Storage, lien partageable 7 jours.
9. **Calibrage par âge** — normes respiration : adultes 12-20 cycles/min au repos.

---

## 🏅 BADGES ET GAMIFICATION

```typescript
const BADGES = [
  { id: 'first_session',    name: 'Premier souffle',    description: 'Première séance complétée' },
  { id: 'week_1',           name: 'Semaine 1',           description: '7 jours consécutifs' },
  { id: 'pause_20',         name: 'Pause 20s',           description: 'Tenir 20 secondes de pause' },
  { id: 'pause_25',         name: 'Pause 25s',           description: 'Tenir 25 secondes de pause' },
  { id: 'nasale_master',    name: 'Nez libre',           description: '10 séances nasales réussies' },
  { id: 'coherence_30',     name: 'Rythme parfait',      description: '30 sessions cohérence cardiaque' },
  { id: 'month_1',          name: '1 mois',              description: '30 jours d\'engagement' },
]
```

Règles :
- Jokers : 2/semaine, reset lundi — pas de "streak brisé" si utilisé
- Pas de classement entre patients
- Badges = jalons positifs uniquement

---

## 🔄 PLAN DE REFACTORING (ÉTAPES)

### S0 — Setup (MAINTENANT)
- [ ] `supabase/migrations/001_initial_schema.sql` — créer les tables
- [ ] Supabase project → nouveau projet "respirfacile" sur console.supabase.com
- [ ] `.env` → remplir VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
- [ ] `npm install` → vérifier que ça compile
- [ ] `src/integrations/supabase/types.ts` → régénérer avec `supabase gen types`

### S1 — Auth + Onboarding (Semaine 1-2)
- [ ] `AuthContext.tsx` → changer les roles PMV → roles respirfacile (garder la structure)
- [ ] Signup ortho : role=`therapist`, génère code `PRO-XXXXXX`, trial 30j
- [ ] Signup patient : via code PRO, role=`patient`, lié au thérapeute
- [ ] `UnifiedLanding.tsx` → remplacer tout le contenu PMV par contenu respirfacile
- [ ] `ProLanding.tsx` → landing ortho respirfacile

### S2 — Exercices (Semaine 3-4)
- [ ] `src/data/exercises.ts` → remplacer les exercices PMV par catalogue respirfacile
- [ ] `SessionLive.tsx` → adapter interface temps réel (timer pause contrôlée, guidage)
- [ ] `Practice.tsx` → liste exercices filtrée par profil patient
- [ ] Dashboard patient → afficher programme semaine, progression

### S3 — Bilan ortho (Semaine 5-6)
- [ ] Export PDF bilan (`@react-pdf/renderer` — déjà installé)
- [ ] Upload audio séance → Supabase Storage → lien partageable
- [ ] Graphiques progression par exercice (recharts — déjà installé)

### S4 — Stripe (Semaine 7-8)
- [ ] Edge Function `create-setup-intent` → trial 30j sans CB
- [ ] Edge Function `stripe-webhook` → gérer subscription events
- [ ] `Pricing.tsx` → adapter aux 3 plans respirfacile
- [ ] `ProSubscription.tsx` → flow abonnement

---

## 🚀 COMMANDES UTILES

```bash
# Développement
npm run dev              # Vite dev server → localhost:5173
npm run build            # Build prod
npm run test             # Vitest

# Supabase (nécessite supabase CLI)
supabase start           # DB locale
supabase db push         # Appliquer migrations
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Variables d'env requises
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

---

## ❌ ERREURS FRÉQUENTES À ÉVITER

1. **Ne pas importer depuis `next/*`** — c'est Vite, pas Next.js. Router = react-router-dom.
2. **Ne pas utiliser `useServerInsertedHTML` ou Server Components** — client-side only.
3. **Toujours vérifier RLS** avant d'écrire une query Supabase — les patients ne doivent JAMAIS voir les données des autres.
4. **Ne pas appeler `supabase.auth.admin.*` côté client** — admin API = Edge Functions seulement.
5. **Données médicales = JSONB dans `sessions.metrics`** — flexible, permet d'ajouter des métriques sans migration.
6. **`therapist_code`** est unique et généré à la création du compte — ne jamais le laisser NULL pour un thérapeute.
7. **Ne pas supprimer `wavesurfer.js`** — sera utilisé pour visualisation de la respiration en séance live.
8. **Ne pas toucher `src/components/ui/`** — bibliothèque Shadcn, régénérée par CLI.
9. **Les routes protégées** utilisent `<ProtectedRoute>` — vérifier le role avant chaque page.
10. **Stripe webhook** doit être idempotent — vérifier `subscription_id` avant d'update.

---

## 📞 CONTEXTE BUSINESS

- **Fondateur** : Clément (Annecy, France)
- **App source** : parlermoinsvite.fr (même codebase, même Supabase)
- **Validé terrain** : Mathilde (ortho), feedback Avril 2026
- **Concurrents** : myofunctional therapy apps US, aucun acteur FR sérieux
- **Marché** : 4-6% population FR = SAOS, + TMD/TMOF — marché inexploité en SaaS
- **B2B cible** : orthophonistes + kinésithérapeutes (RPPS profession 50)

---

*Dernière mise à jour : Avril 2026*
