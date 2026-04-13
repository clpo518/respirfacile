

# Corrections suite au retour orthophoniste

## Problemes identifies (7 points)

### 1. Faux blocages (priorite haute)
Le graphique marque 9 "blocages" qui n'en sont pas. Le seuil actuel est de 2.0s de silence (`BLOCK_SILENCE_MIN`), ce qui est trop bas : des pauses respiratoires normales sont comptees comme des blocages. De plus, la detection ne prend pas en compte le contexte (fin de phrase, changement de sujet).

**Correction** : Monter le seuil de blocage a 3.0s (au lieu de 2.0s), et ajouter une heuristique supplementaire : exclure les silences qui tombent entre deux segments de parole separes (ce sont des pauses naturelles inter-phrases). Ajouter aussi la detection de la ponctuation implicite via la transcription Deepgram (fins de phrases).

### 2. Couleurs blocages vs "trop rapide" trop proches
Les blocages (rose-red `hsl(330 78% 56%)`) et les points "trop rapide" (rouge destructive) sont visuellement confondus par les patients. L'ortho dit que les couleurs sont trop proches.

**Correction** : Changer la couleur des blocages pour un violet distinct (ex: `hsl(280 70% 55%)`) et utiliser des losanges plus grands ou un symbole different (triangle pointe en bas) pour mieux les distinguer des cercles rouges "trop rapide".

### 3. Score de bredouillement trop alarmant
Le score indique "bredouillement severe 6.5/10" alors que cliniquement ce n'est pas le cas. Problemes :
- Le burst threshold est trop sensible : `(good + bad) / 2` = ~0.65 SPS au-dessus de la cible, ce qui declenche des "accelerations" pour des variations normales
- Le scoring passe en "severe" des 5/10, ce qui est trop bas
- Le label "Severe" est anxiogene pour les patients

**Corrections** :
- Augmenter le burst threshold a `bad` (au lieu de `(good+bad)/2`) pour ne detecter que les vraies accelerations
- Augmenter le seuil de burst min duration de 0.25s a 0.5s
- Reechelonner la severite : mild <= 3.5, moderate <= 6.5, severe > 6.5 (au lieu de 2.5/5)
- Pour les patients : ne jamais afficher le mot "severe" ni le score /10. Utiliser des formulations douces ("Rythme a travailler")
- Reduire le poids des bursts dans le score (max 2 pts au lieu de 3)

### 4. Ajout des textes de la batterie standardisee
L'ortho demande les textes exacts de la batterie "Test du Produit Humain" (evaluation du bredouillement) :
- Le texte "Les deux femmes habitaient une petite maison..." (texte diagnostic, deja present)
- Les epreuves de repetition de mots ("gentillesse et malice", etc.)
- L'histoire a raconter (retelling avec porte-monnaie)

**Correction** : Ajouter une nouvelle categorie d'exercices "Bilan" ou "Evaluation" dans `exercises.ts` avec les textes standardises de la batterie, en verifiant les droits d'utilisation (la batterie semble etre en libre acces).

### 5. Integration des normes par age
L'ortho mentionne que des normes existent pour le debit mais qu'elles sont "un peu a la legere". Elle souhaite que les normes soient integrees pour contextualiser les resultats.

**Correction** : Le fichier `ageNormsUtils.ts` existe deja. Verifier qu'il est bien utilise dans le ClutteringCard et le bilan pour comparer le debit du patient aux normes de son groupe d'age, et afficher cette comparaison.

### 6. Synchronisation waveform/SPS douteuse
L'ortho note que les points rouges "trop rapide" apparaissent parfois quand le patient ne parle pas. Cela pointe vers un probleme d'alignement temporel entre la courbe SPS et l'audio.

**Correction** : Verifier dans `ClinicalWaveform` que les alertPoints ne sont affiches que pour des samples avec `sps > 0` (pas de faux points dans les silences).

### 7. Affichage patient vs ortho
Les patients voient des informations anxiogenes (9 blocages, bredouillement severe). La differenciation `isTherapist` n'est pas assez poussee.

**Correction** : Cote patient, masquer completement la ClutteringCard si severity est "mild", et reformuler les labels pour les severites plus hautes. Remplacer "Hesitations : 9 blocages" par "Hesitations" tout court (sans le nombre) ou ne pas afficher du tout la legende blocages si le nombre est < 3.

---

## Plan d'implementation

| Etape | Fichier(s) | Action |
|-------|-----------|--------|
| 1 | `analyzeDisfluency.ts` | Monter BLOCK_SILENCE_MIN a 3.0s, ajouter heuristique fin de phrase |
| 2 | `clutteringProfile.ts` | Augmenter burst threshold, burst min duration, reechelonner severite, adoucir labels patient |
| 3 | `ClinicalWaveform.tsx` | Changer couleur blocages (violet), filtrer alertPoints silences, adoucir legende patient |
| 4 | `ClutteringCard.tsx` | Masquer pour patients si mild, jamais afficher "severe" cote patient |
| 5 | `exercises.ts` | Ajouter categorie Evaluation avec textes batterie standardisee |
| 6 | Verification normes `ageNormsUtils.ts` | S'assurer que les normes sont utilisees dans le bilan |

