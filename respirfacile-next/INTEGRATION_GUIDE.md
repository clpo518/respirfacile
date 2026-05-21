# Guide d'intégration — Pages et Layouts

## Fichiers créés

### Pages
- `app/profile/page.tsx` — Profil public patient ✓
- `app/settings/page-improved.tsx` — Paramètres améliorés ✓
- `app/dashboard/page-enhanced.tsx` — Dashboard avec bottom nav mobile ✓

### Composants
- `components/layout/PatientLayout.tsx` — Layout wrapper patients ✓
- `components/layout/TherapistLayout.tsx` — Layout wrapper thérapeutes ✓
- `components/MobileBottomNavClient.tsx` — Navigation mobile (client) ✓
- `components/MobileBottomNav.tsx` — Navigation mobile (server) ✓
- `components/TrialBanner.tsx` — Banneau essai gratuit ✓

### Formulaires
- `app/settings/SettingsPasswordForm.tsx` — Changement mot de passe ✓
- `app/settings/SettingsDiagnosticForm.tsx` — Sélection diagnostic ✓

## Étapes d'intégration

### 1. Ajouter la bottom nav mobile aux pages patients

Pour chaque page patient (exercises, journal, ressources, history):

```tsx
// Import en haut
import { MobileBottomNavClient } from "@/components/MobileBottomNavClient";

// Dans main
<main className="max-w-6xl mx-auto px-4 py-8 pb-28 md:pb-0">
  {/* contenu */}
  <MobileBottomNavClient />
</main>
```

### 2. Merger settings/page.tsx

Copier le contenu de `page-improved.tsx` dans `page.tsx` existant.

### 3. Utiliser les layouts (optionnel)

PatientLayout pour les pages patient:
```tsx
import { PatientLayout } from "@/components/layout/PatientLayout";

export default function Page() {
  return (
    <PatientLayout>
      {/* contenu */}
    </PatientLayout>
  );
}
```

TherapistLayout pour les pages thérapeute:
```tsx
import { TherapistLayout } from "@/components/layout/TherapistLayout";

export default function Page() {
  return (
    <TherapistLayout>
      {/* contenu */}
    </TherapistLayout>
  );
}
```

### 4. Ajouter TrialBanner sur pages thérapeute

```tsx
import { TrialBanner } from "@/components/TrialBanner";

<TrialBanner
  status={profile?.subscription_status}
  trialEndsAt={profile?.trial_ends_at}
/>
```

## Notes
- MobileBottomNavClient = "use client" (pour usePathname())
- PatientLayout/TherapistLayout = "use client" pour menus interactifs
- TrialBanner = server component (pas d'interactivité)
- pb-28 md:pb-0 sur main = espace pour bottom nav mobile
