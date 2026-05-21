# Respirfacile — Guide de déploiement

Plateforme B2B de rééducation respiratoire pour patients SAOS (apnée du sommeil) et TMOF (thérapie myofonctionnelle orofaciale). Orthophonistes et kinésithérapeutes prescrivent, patients progressent avec des exercices guidés et un suivi en temps réel.

## 📊 Stack technique

- **Next.js 14** App Router + TypeScript  
- **Supabase** (Auth + PostgreSQL + Edge Functions + Storage + RLS)
- **Stripe** (abonnements B2B, trial 30j sans CB)
- **Tailwind CSS v3** + Shadcn/ui + Radix UI
- **Recharts** (graphiques de progression)
- **Canvas-confetti** (célébrations badges)
- **Sonner** (notifications toast)
- **@react-pdf/renderer** (export PDF bilans)
- **Vitest + @testing-library/react** (tests unitaires)

## 📁 Architecture

```
app/                        # Next.js App Router pages
├── (auth)/                 # Pages d'authentification
├── (marketing)/            # Pages publiques (landing, pricing)
├── dashboard/              # Patient dashboard
├── exercises/              # Catalogue exercices
├── session/[id]/           # Séance en temps réel
├── journal/                # Journal de bord
├── history/                # Historique séances
├── resources/              # Ressources pédagogiques
├── therapist/              # Dashboard ortho/kiné
├── settings/               # Paramètres profil
├── admin/                  # Panel admin
└── api/                    # Routes API

components/
├── landing/                # Composants landing page
├── dashboard/              # Widgets patient
├── therapist/              # Composants ortho
├── journal/                # Journal de bord
├── exercises/              # Affichage exercices
├── auth/                   # Formulaires auth
└── ui/                     # Shadcn/ui components

supabase/
├── migrations/             # SQL (à exécuter dans l'ordre)
│   ├── 001_initial_schema.sql      # Tables core
│   ├── 002_programs_badges.sql     # Programmes patient + badges
│   └── 003_journal_entries.sql     # Journal de bord
└── functions/              # Edge Functions Deno (Stripe webhooks)

lib/
├── supabase/
│   ├── client.ts           # Client côté navigateur
│   ├── server.ts           # Client côté serveur (SSR)
│   └── types.ts            # Types TypeScript
├── utils/
├── data/
│   └── exercises.ts        # Catalogue 8 exercices respirfacile
└── constants/

hooks/                      # Hooks React custom

types/                      # Types globaux TypeScript

public/                     # Assets statiques
```

## 🚀 Mise en production (checklist)

### 1. Préparer Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (PostgreSQL 15+)
3. Dans SQL Editor, exécuter les migrations **dans l'ordre** :
   ```sql
   -- 1. Schéma initial (users, therapists, sessions, etc.)
   SELECT * FROM migrations; -- Voir 001_initial_schema.sql
   
   -- 2. Programmes patient + badges
   SELECT * FROM migrations; -- Voir 002_programs_badges.sql
   
   -- 3. Journal de bord
   SELECT * FROM migrations; -- Voir 003_journal_entries.sql
   ```
4. Activer **RLS** (Row Level Security) sur toutes les tables médicales
5. Récupérer dans **Settings > API** :
   - Project URL (ex: `https://xxx.supabase.co`)
   - `anon key` (clé publique)
   - `service_role` key (clé secrète)

### 2. Configurer Stripe

1. Créer un compte business sur [stripe.com](https://stripe.com)
2. Créer 3 produits avec prix récurrents mensuels :
   ```
   • Starter        15€/mois  → max 5 patients  (noter Price ID)
   • Pro            30€/mois  → max 20 patients (noter Price ID)
   • Cabinet        55€/mois  → illimité        (noter Price ID)
   ```
3. Configurer webhook public : `https://[ton-domaine]/api/stripe-webhook`
   - Événements à activer :
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Récupérer dans **Settings > Keys and credentials** :
   - Publishable Key (`pk_live_...`)
   - Secret Key (`sk_live_...`)
5. Récupérer Webhook Signing Secret dans **Webhooks**

### 3. Déployer sur Vercel

```bash
# Option A : CLI Vercel
npm i -g vercel
vercel --prod

# Option B : Connexion GitHub via vercel.com
# 1. Pousser le code vers un repo GitHub
# 2. Aller sur vercel.com, importer le repo
# 3. Les variables d'env se configurent automatiquement
```

### 4. Configurer les variables d'environnement

Dans **Vercel Settings > Environment Variables**, ajouter :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_1234567890
STRIPE_PRICE_PRO=price_0987654321
STRIPE_PRICE_CABINET=price_1111111111

# App
NEXT_PUBLIC_APP_URL=https://respirfacile.fr

# Email (Resend - optionnel pour transactionnels)
RESEND_API_KEY=re_...
```

### 5. Edge Functions Supabase

Déployer les functions qui gèrent Stripe :

```bash
# Installer CLI Supabase
npm i -g supabase

# Se connecter
supabase login

# Lier au projet
supabase link --project-ref [ref-du-projet]

# Ajouter les secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_STARTER=price_...
supabase secrets set STRIPE_PRICE_PRO=price_...
supabase secrets set STRIPE_PRICE_CABINET=price_...

# Déployer les functions
supabase functions deploy
```

## 🧪 Test en local

```bash
# Cloner et installer
git clone [repo-url]
cd respirfacile-next
npm install

# Copier le fichier d'exemple
cp .env.example .env.local

# Remplir .env.local avec les vraies valeurs Supabase/Stripe
nano .env.local

# Lancer le serveur dev
npm run dev
# → http://localhost:3000

# En parallèle : lancer Supabase local (optionnel)
supabase start
```

## 📖 Workflows clés

### Signup Orthophoniste

1. Page `/auth` → formulaire signup avec email/password
2. Système crée : `profiles` avec `role='therapist'` + `therapist_code` unique (`PRO-XXXXX`)
3. Trial 30j créé automatiquement (Stripe SetupIntent = pas de CB demandée tout de suite)
4. Landing dashboard ortho → affiche code PRO à partager
5. À J30 : webhooks Stripe demandent la CB, ou trial expire

### Signup Patient via Code PRO

1. Page `/auth` → formulaire signup avec email + code PRO (ex: `PRO-ABCD1234`)
2. Système valide le code (lookup dans `profiles.therapist_code`)
3. Crée : `profiles` avec `role='patient'` + liaison dans `therapist_patients`
4. Redirection vers `/onboarding` → choix du profil (adult_saos_mild, adult_tmof, etc.)
5. Crée entrée `patient_programs` avec programme de la semaine

### Séance d'exercice

1. Patient clique exercice depuis `/exercises`
2. Lance `/session/[id]` → interface temps réel
3. Chronomètre + guidage audio/texte
4. À la fin : enregistrement automatique dans `sessions` table
5. Calcul du score, unlock potentiel badge
6. Retour dashboard avec graphique progression

### Consultation Ortho

1. Dashboard ortho → liste patients liés
2. Clique patient → `/therapist/patients/[id]`
3. Vue récapitulative : programme en cours + bilans passés
4. Bouton **Export PDF** → génère bilan @react-pdf
5. Optionnel : accès aux enregistrements audio séances (Supabase Storage)

## 🔐 Sécurité

- **RLS activé** sur `sessions`, `patient_programs`, `journal_entries`, `user_badges`
  - Patients ne voient QUE leurs propres données
  - Orthos voient uniquement leurs patients liés
  - Admin voit tout
- **Middleware Next.js** protège toutes les routes authentifiées
- **Vérification webhook Stripe** par signature (impossible à falsifier)
- **Service Role Key** jamais exposé côté navigateur (Edge Functions seulement)
- **Données médicales** en JSONB flexible dans `sessions.metrics`

## ⚠️ Contraintes médicales (NON-NÉGOCIABLES)

1. **Ne jamais dire "BOLT"** aux utilisateurs — dire "Pause Contrôlée"
2. **Ne jamais promettre de guérison SAOS** — mention obligatoire : "complément de traitement"
3. **Pas d'exercice pause contrôlée seul** pour SAOS sévère (risque hypoxie)
4. **Score de pause = nombre de pas** (pas les secondes)
5. **Séances max 20 min/jour** — au-delà = contre-productif
6. **Jokers obligatoires** : 2/semaine, reset lundi (pas de streak punitif)
7. **Export PDF non-optionnel** pour bilans ortho (S2)
8. **Partage audio séance** optionnel, 7j d'accès max (sécurité données)
9. **Calibrage par âge** : normes respiration adultes 12-20 cycles/min au repos

## 📊 Monitoring post-lancement

- ✅ Vérifier que le trigger `handle_new_user` crée bien les profils
- ✅ Tester flow complet : signup ortho → code PRO → signup patient → séance → journal
- ✅ Vérifier les webhooks Stripe (logs dans dashboard Stripe)
- ✅ Tester RLS : patient ne peut pas voir données d'un autre patient
- ✅ Vérifier que l'export PDF fonctionne
- ✅ Tester le reset hebdomadaire des jokers (lundi)

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| "Missing RLS policy" | Activer RLS + créer policies pour chaque table |
| Stripe webhook échoue | Vérifier Webhook Secret dans .env + IP Stripe whitelisted |
| Patient voit données d'un autre | RLS mal configurée — vérifier `auth.uid()` dans policies |
| Trial expire mais pas de email | RESEND_API_KEY manquante — optionnel mais recommandé |
| "therapist_code unique constraint" | Code PRO déjà utilisé — générer nouveau avec UUID |

## 📞 Support

Pour toute question sur l'architecture ou déploiement :
- Lire le fichier `CLAUDE.md` dans le repo (instructions complètes)
- Contacter : clement@escape-kit.com
