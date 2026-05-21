# Respirfacile — Deployment Checklist

Utilise cette liste de contrôle pour déployer Respirfacile en production.

## Phase 1 : Infrastructure (1-2 jours)

- [ ] **Supabase**
  - [ ] Créer compte supabase.com
  - [ ] Nouveau projet PostgreSQL 15+
  - [ ] Exécuter les 3 migrations SQL (dans l'ordre)
  - [ ] Activer RLS sur toutes les tables médicales
  - [ ] Récupérer Project URL et anon key
  - [ ] Récupérer service_role key
  
- [ ] **Stripe**
  - [ ] Créer compte Stripe (mode live)
  - [ ] Créer 3 produits (Starter 15€, Pro 30€, Cabinet 55€)
  - [ ] Noter les 3 Price IDs
  - [ ] Configurer webhook : `https://[domaine]/api/stripe-webhook`
  - [ ] Récupérer Publishable Key et Secret Key
  - [ ] Récupérer Webhook Signing Secret
  
- [ ] **Domaine**
  - [ ] Réserver respirfacile.fr (ou autre)
  - [ ] Configurer DNS
  - [ ] Générer certificat SSL
  
- [ ] **Vercel**
  - [ ] Créer compte vercel.com
  - [ ] Importer le repo GitHub
  - [ ] Configurer toutes les Environment Variables (voir .env.example)

## Phase 2 : Configuration (1 jour)

- [ ] **Variables d'environnement (Vercel)**
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] STRIPE_PRICE_STARTER
  - [ ] STRIPE_PRICE_PRO
  - [ ] STRIPE_PRICE_CABINET
  - [ ] NEXT_PUBLIC_APP_URL (https://respirfacile.fr)

- [ ] **Edge Functions Supabase**
  - [ ] Installer Supabase CLI
  - [ ] Déployer les functions
  - [ ] Ajouter les secrets Stripe
  
- [ ] **Email (optionnel)**
  - [ ] Créer compte Resend.com (ou autre)
  - [ ] Générer API key
  - [ ] Tester emails transactionnels

## Phase 3 : Tests (1-2 jours)

- [ ] **Authentication Flow**
  - [ ] [ ] Signup ortho : `/auth` → génère code `PRO-XXXXX`
  - [ ] [ ] Signup patient : via code PRO → lien créé avec ortho
  - [ ] [ ] Login/logout fonctionne
  - [ ] [ ] Password reset fonctionne
  - [ ] [ ] Trial 30j créé sans demander CB

- [ ] **Patient Journey**
  - [ ] [ ] Onboarding : choix profil SAOS/TMOF
  - [ ] [ ] Affichage programme semaine
  - [ ] [ ] Lancer une séance
  - [ ] [ ] Score calculé et sauvegardé
  - [ ] [ ] Badge débloqué (si applicable)
  - [ ] [ ] Journal de bord : entrées visibles
  - [ ] [ ] Graphique progression : données affichées

- [ ] **Therapist Flow**
  - [ ] [ ] Dashboard ortho : affiche code PRO
  - [ ] [ ] Voir liste patients liés
  - [ ] [ ] Cliquer sur patient : voir détails
  - [ ] [ ] Export PDF : génère bilan

- [ ] **Stripe Payment**
  - [ ] [ ] Trial 30j : pas de CB demandée à signup
  - [ ] [ ] Après 30j : demande CB
  - [ ] [ ] Paiement mensuel renouvelle abonnement
  - [ ] [ ] Webhook : reçoit events de Stripe

- [ ] **RLS & Sécurité**
  - [ ] [ ] Patient A ne voit PAS données patient B
  - [ ] [ ] Ortho A ne voit PAS patients de l'ortho B
  - [ ] [ ] Admin voit tout
  - [ ] [ ] Pas d'accès direct aux tables via Supabase dashboard (hormis admin)

## Phase 4 : Monitoring (post-launch)

- [ ] **Logs & Analytics**
  - [ ] [ ] Vercel : vérifier pas d'erreurs 5xx
  - [ ] [ ] Supabase : vérifier pas d'erreurs RLS
  - [ ] [ ] Stripe : vérifier webhooks reçus
  - [ ] [ ] Google Analytics / Sentry : configurés

- [ ] **Database Health**
  - [ ] [ ] Trigger `handle_new_user` fonctionne
  - [ ] [ ] Trigger `reset_weekly_jokers` (lundi)
  - [ ] [ ] Pas de données orphelines (user_id invalide)
  - [ ] [ ] Backups Supabase activés

- [ ] **User Feedback**
  - [ ] [ ] Répondre aux support emails
  - [ ] [ ] Tracker bugs reportés
  - [ ] [ ] Suivi satisfaction 1ère semaine

## Phase 5 : Communication (1-2 jours après launch)

- [ ] **Annonce**
  - [ ] [ ] Post LinkedIn/Twitter
  - [ ] [ ] Email aux premiers orthos
  - [ ] [ ] Mettre à jour landing page

- [ ] **Documentation**
  - [ ] [ ] FAQ pour orthos (comment utiliser code PRO)
  - [ ] [ ] FAQ pour patients (comment ça marche)
  - [ ] [ ] Support email configuré

## Checklist de sécurité (obligatoire)

- [ ] **Données médicales**
  - [ ] RLS activé sur sessions, patient_programs, journal_entries
  - [ ] Pas de logs contenant données sensibles
  - [ ] Backups chiffrés
  - [ ] Plan RGPD/CNIL défini

- [ ] **Authentification**
  - [ ] Supabase Auth = seule source de vérité
  - [ ] Sessions JWT valides
  - [ ] Pas de hardcoded credentials

- [ ] **Stripe**
  - [ ] Webhook signé et vérifié
  - [ ] Pas de Price IDs en clair
  - [ ] Webhook Secret en variable d'env
  - [ ] Pas de CB stockée (Stripe gère)

- [ ] **Infrastructure**
  - [ ] HTTPS everywhere (Vercel + Supabase)
  - [ ] CORS configuré (whitelist domaines)
  - [ ] Rate limiting sur API (optionnel : Upstash)
  - [ ] Pas de secrets dans .env (version control)

## Post-Launch (1 mois)

- [ ] **Usage Analytics**
  - [ ] Nombre d'orthos signups
  - [ ] Nombre de patients liés
  - [ ] Nombre de séances complétées
  - [ ] Taux de trial → paid

- [ ] **Feedback & Iterations**
  - [ ] Recueillir feedback orthos
  - [ ] Recueillir feedback patients
  - [ ] Priorité : bugs blocking experience
  - [ ] Itérer sur UX

- [ ] **Optimizations**
  - [ ] Vitesse chargement pages
  - [ ] Erreurs non-gérées
  - [ ] Utilisation storage (fichiers PDF, audio)

## Support (escalade)

| Problème | Who | How |
|----------|-----|-----|
| Erreur technique | Tech team | Sentry logs + Vercel dashboard |
| Supabase down | Supabase support | support@supabase.com |
| Stripe issue | Stripe support | dashboard.stripe.com |
| RGPD/legal | Legal team | Contacter avocat |

---

**Last updated:** April 26, 2026  
**Status:** Ready for production  
**Owner:** Clément (clement@escape-kit.com)
