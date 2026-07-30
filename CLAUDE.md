# CLAUDE.md — respirfacile

> Lis ce fichier en entier avant de toucher au code. Dernière mise à jour : 30 juillet 2026.

---

## Ce qu'est ce projet

**respirfacile** = application web de rééducation myofonctionnelle orofaciale et respiratoire, pour les
patients suivis pour des troubles respiratoires du sommeil (ronflement, apnées légères à modérées,
respiration buccale) et pour la thérapie myofonctionnelle.

Modèle B2B : l'orthophoniste ou le kinésithérapeute paie un abonnement, ses patients accèdent
gratuitement via un code. Second projet de Clément, après parlermoinsvite.fr, dont il reprend
l'architecture et les règles de travail.

---

## ⚠️ Deux applications dans ce dépôt : ne pas se tromper

| Dossier | Techno | Statut |
|---------|--------|--------|
| **`respirfacile-next/`** | **Next.js 16 (App Router) + React 19** | **C'est l'application vivante. Tout le travail se fait ici.** |
| racine (`src/`, `index.html`, `vite.config.ts`) | React 18 + Vite + react-router | Legacy, plus déployée. Ne rien y ajouter. |

Le projet Vercel déployé est `respirfacile-next`. Les anciennes versions de ce fichier décrivaient
l'application Vite et interdisaient d'importer depuis `next/*` : cette consigne est **caduque et
inversée**. Dans `respirfacile-next/`, on écrit du Next.js App Router.

---

## Stack de l'application vivante

```
Next.js 16 (App Router, Server Components) + React 19 + TypeScript
Supabase (Auth + PostgreSQL + Edge Functions + Storage + RLS) — projet fjamlwnxsbdwwtavecmd, région Paris
Tailwind CSS v3 + composants maison (pas de shadcn complet, juste ui/button et ui/Logo)
react-hook-form + zod, @tanstack/react-query, recharts, framer-motion, sonner
Stripe (SetupIntent : essai 30 jours sans carte bancaire)
Vitest pour les tests
```

Commandes, depuis `respirfacile-next/` :

```bash
npm run dev          # localhost:3000
npm run build        # build production
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run
npm run verify       # les trois d'un coup, à passer avant toute PR
```

---

## Où en est le produit (30/07/2026)

- Le site répond sur le domaine Vercel. **`respirfacile.fr` n'est pas encore enregistré** : tant que
  c'est le cas, ne pas figer d'URL absolue en dur, tout passe par `lib/site.ts`.
- Base de données : 16 profils, 4 liens praticien-patient, 6 séances, 1 programme. C'est un
  pré-lancement, pas une base d'utilisateurs.
- Stripe n'est pas branché en production (clés d'exemple dans `.env.local`).
- Aucun article de blog n'est écrit : `/blog` est volontairement en `noindex`.

---

## Règles non négociables

### Vérité des allégations

1. **Aucun chiffre d'efficacité sans source.** Toute donnée clinique affichée vient de
   `lib/content/evidence.ts`, avec sa référence et sa limite. Rien d'autre.
2. **Aucun témoignage, aucune note de satisfaction, aucun compteur d'utilisateurs inventé.** Le site
   en contenait (85 professionnels, 4,8/5, 78 % de régularité) : tout a été retiré en juillet 2026.
   Sur un produit de santé, c'est une pratique commerciale trompeuse. Ne jamais les réintroduire,
   même « en attendant les vrais chiffres ».
3. **Jamais de promesse de guérison, jamais le verbe « garantir ».** L'application est un complément
   de soin. Un test le vérifie sur le catalogue d'exercices.
4. **Ne jamais présenter la rééducation comme un substitut à la pression positive continue.** La
   revue Cochrane 2020 dit l'inverse, et c'est cité tel quel sur le site.

### Sécurité clinique

5. **Les exercices d'apnée volontaire (`category: "pause_controlee"`) sont contre-indiqués en SAOS
   sévère.** La contre-indication est déclarée dans `contraindications`, et c'est elle qui fait foi
   au filtrage, pas `target_profile`.
6. **Tant qu'aucun profil n'est prescrit, aucune apnée volontaire n'est proposée.** Passer par
   `getVisibleExercises(profile)`, jamais par un `EXERCISES.filter()` maison. Régression corrigée le
   30/07/2026 : l'écran `/exercises` affichait tout le catalogue aux patients sans programme.
7. **Ne jamais dire « BOLT » au patient.** Terme inconnu des orthophonistes françaises. On dit
   « Pause Contrôlée ». Toléré dans `therapist_note_fr` uniquement, un test le vérifie.
8. **Score de pause = nombre de pas**, pas de secondes seules.
9. **20 minutes de séance par jour maximum.** Au-delà, hyperventilation compensatoire.
10. **Pas de gamification punitive** sur un exercice thérapeutique : jamais de série brisée, jokers
    hebdomadaires obligatoires.
11. **RLS dans la même migration que la table.** Jamais reporté.

### Langue et ton (identiques à parlermoinsvite)

12. Tout le texte visible est en **français**, accentué. Pas d'anglais, pas de « trial », pas de « CB ».
13. **Vouvoiement** du patient adulte, toujours.
14. **« je », jamais « nous » ni « on ».** Clément est seul. Pas d'équipe sous-entendue.
15. **Jamais le nom de famille.** « Clément », ou « Clément, fondateur ».
16. **Jamais « ortho » ni « kiné »** en texte visible : « orthophoniste », « kinésithérapeute ».
17. Pas de tiret cadratin dans le texte courant.
18. Adresse de contact unique : `contact@respirfacile.fr`. Aucune variante nominative.

---

## Architecture des contenus

| Fichier | Rôle |
|---------|------|
| `lib/site.ts` | URL du site (via `NEXT_PUBLIC_APP_URL`), éditeur légal, adresse de contact. Source unique. |
| `lib/routes.ts` | Inventaire des routes publiques. Alimente `app/sitemap.ts` et `app/robots.ts`. Une page publique non déclarée ici n'est pas indexée. |
| `lib/content/evidence.ts` | Les trois références cliniques citées, avec leurs limites. |
| `lib/content/faq.ts` | Les questions fréquentes. Alimente à la fois l'affichage et le JSON-LD `FAQPage` : ne jamais dupliquer. |
| `lib/data/exercises.ts` | Catalogue clinique, 16 exercices, et les fonctions de filtrage sécurisé. |

---

## Base de données

Projet Supabase `fjamlwnxsbdwwtavecmd` (région eu-west-3, Paris). Tables : `profiles`,
`therapist_patients`, `patient_programs`, `sessions`, `assignments`, `prescriptions`,
`session_notes`, `messages`, `voice_recordings`, `user_badges`, `email_logs`. RLS activée partout.

Migrations dans `supabase/migrations/`, versionnées `AAAAMMJJ_HHMMSS_slug.sql`. Les migrations
antérieures à `20260413000001_respirfacile_initial_schema.sql` sont héritées de parlermoinsvite,
ne pas s'y fier pour le schéma actuel.

---

## Tarification

| Plan | Prix | Patients |
|------|------|----------|
| Starter | 15 €/mois | 5 |
| Pro | 30 €/mois | 20 |
| Cabinet | 55 €/mois | illimité |

Essai 30 jours sans carte bancaire (SetupIntent Stripe, carte demandée à l'expiration).
Le patient ne paie jamais rien.

---

## Ce qui reste cassé (au 31/07/2026)

À traiter, dans cet ordre.

1. **Deux politiques RLS dangereuses sont encore actives en base.** La migration
   `20260731000002_fix_rls_escalade_privileges.sql` les supprime mais n'a pas pu
   être appliquée automatiquement. Tant qu'elle n'est pas passée :
   - `profiles.admin_all_profiles` permet à n'importe quel compte de s'octroyer
     un accès total aux profils via `user_metadata`, modifiable côté client ;
   - `therapist_patients.service_role_all` permet à n'importe quel compte de se
     rattacher à n'importe quel patient, ce qui débloque ses séances, son
     journal et ses notes.
2. **`profiles.public_can_lookup_therapist_code`** autorise le rôle `anon` à
   lire les lignes des praticiens ayant un code, colonnes comprises : les
   adresses électroniques des praticiens sont énumérables sans compte. À
   remplacer par une fonction dédiée qui ne renvoie que l'existence du code.
3. **Vue `prescription_completion` en `SECURITY DEFINER`**, signalée en erreur
   par le linter Supabase.
4. **Le partage du bilan par email pointe vers une route morte.**
   `/api/bilan/[patientId]` n'accepte que POST ; le médecin destinataire tombe
   sur une erreur. Le vrai bilan vit désormais sur
   `/therapist/patients/[id]/bilan`, mais il demande une session praticien : un
   partage externe suppose un lien signé à durée limitée, qui reste à écrire.
5. **`/api/bilan/[patientId]` et `/api/bilan/share` sont deux copies du même
   code.** À fusionner.
6. **Dette `any` et règles react-hooks** en avertissement dans la configuration
   ESLint. À rembourser après `supabase gen types`.

## Pièges connus

- `typescript.ignoreBuildErrors` a été retiré de `next.config.ts` : ne pas le remettre. La clé
  `eslint` n'existe plus dans `NextConfig` depuis Next 16, elle faisait échouer `tsc`.
- Ce dépôt vit dans OneDrive : les artefacts `.fuse_hidden*` et `*.clean` réapparaissent parfois
  après une session en sandbox Linux. Ils sont ignorés par git, à supprimer sans état d'âme.
- Les canonical pointaient vers `https://respirfacile.fr`, domaine qui ne résout pas. Toujours
  passer par `absoluteUrl()`.
- Ne pas toucher au dossier racine Vite en croyant modifier la production.
