@echo off
cd /d "%~dp0"
git config user.email "clement@escape-kit.com"
git config user.name "Clement"
del /f .git\index.lock 2>nul
git add -A
git commit -m "feat: full exercise system + ortho dashboard + patient bilan + home refonte

- lib/data/exercises.ts: catalogue 6 exercices MVP (pause, coherence, nasale, myofonctionnel)
- app/exercises/page.tsx: liste exercices filtrée profil, statut fait/pas fait
- app/session/[exerciseId]/: page.tsx (server) + SessionClient.tsx (client interactif)
  - animation cercle respiratoire CSS
  - timer countdown + progression ring SVG
  - navigation etapes
  - input score (pause) / compteur cycles (coherence)
  - sauvegarde Supabase sessions table
- app/history/page.tsx: historique seances groupees par jour
- app/dashboard/page.tsx: vraies stats DB (seances semaine, score pause, streak)
- app/therapist/page.tsx: dashboard ortho avec observance%, derniere seance, score pause patients
- app/patient/[id]/page.tsx: fiche patient complete avec progression sparkline + historique
- app/api/bilan/[patientId]/route.ts: export bilan HTML imprimable (Ctrl+P -> PDF)
- components/auth/AuthForm.tsx: inscription patient avec code Pro (verifie + lie therapist_patients), fix bug error state
- components/landing/HeroSection.tsx: deux cartes entrees ortho/patient, arguments conversion
- components/landing/ProblemSection.tsx: arguments benefices concrets ortho + patient
- app/settings/page.tsx: role en francais (Orthophoniste vs Patient)"
git push origin main
