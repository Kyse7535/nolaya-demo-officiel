# Démo précurseur + Actes B → E — Cadre · Prestations · Planning · Opportunité · Engagement · Réalisation · Règlement

Prototype Vue autonome dans `demo-precurseur/` (continuité unique, pas de fork).

| Source | Rôle |
| ------ | ---- |
| `construction-demo/2-precurseur-cadre-prestations-planning.md` | Création réelle P1→P2→P3 |
| `construction-demo/3-storyboard-precurseur-cible.md` | Storyboard précurseur |
| `construction-demo/3-storyboard-cible.md` | Storyboard transactionnel (Actes B–E prototypés ici) |
| `construction-demo/2-exemple-concret.md` | Récit métier Sarah / Inès |

## Choix d’architecture

- **Même app** pour précurseur et transaction : le CTA « Continuer vers une demande cliente » sur `/planning/actif` enchaîne vers l’Acte B sans reset cadre / offre / planning.
- **L’Acte A court** du storyboard cible (validation accélérée offre + planning) **n’est pas re-prototypé** : le précurseur P1→P2→P3 le remplace en parcours enchaîné. Point de reprise transactionnel = **Écran 6** (opportunité Inès) après `SCHEDULE_ACTIVE`.
- **Acte E** jouable jusqu’à `SETTLED` + réponse avis + favori + formulaire de clôture.

## Objectif jouable aujourd’hui

1. **P1** — cadre → `PROFESSIONAL_FRAMEWORK_ACTIVE`
2. **P2** — prestation multi-longueurs → `OFFER_ACTIVE`
3. **P3** — planning réel → `SCHEDULE_ACTIVE` (+ injection demande Inès)
4. **Acte B** — examiner → clarifier → faisabilité → offre ferme → `FIRM_PROPOSAL` + `SOFT_HOLD`
5. **Acte C** — séquence Inès → preuves → `COMMITTED` → checklists → `READY` → compression jour J
6. **Acte D** — dossier jour J → `IN_PROGRESS` → événement perles → composition V2 → preuves → qualification → `COMPLETED`
7. **Acte E** — règlement solde → `SETTLED` → avis + réponse → favori → feedback → clôture

Rail Inès (figé) : mi-dos · **170 €** (150 + mèches 20) · acompte **50 €** · **15 août 9 h** · Saint-Denis · budget max 180 €.  
Modification V2 : **+10 € · +20 min** → **180 € · 5 h 50**.  
Règlement : solde **130 €** · frais **18 € (10 %)** · net **162 €**.

## Lancer

```bash
cd demo-precurseur
npm install
npm run dev
```

Build : `npm run build`

## Parcours

### Précurseur (Scène 1/3 → 3/3)

Bandeau : `Création de l’offre · Scène X/3`

Cadre → prestation (prix par longueur) → planning (mar–sam · 9 h–18 h · 1 RDV/jour).  
À l’activation du planning : injection déterministe de la demande Inès.

### Acte B (Scène 2/5 → 3/5)

Bandeau : `Inès est une cliente simulée · Scène 2/5` (puis **3/5** après envoi de l’offre).

| Route | Écran | Décision |
| ----- | ----- | -------- |
| `/opportunites` | 6 — Invitation | 1 CTA + sheet « Pourquoi cette invitation ? » |
| `/opportunites/dossier` | 7 — Dossier | Précision / proposition gated / refus récupérable |
| `/opportunites/clarification` | 8 — Clarification | 2 questions requises + 1 optionnelle ; réponses Inès déterministes |
| `/opportunites/proposition` | 9 — Faisabilité + offre | Checklist puis confirmation rail 170 € / 50 € / 15 août 9 h |
| `/opportunites/proposition-envoyee` | Sortie B | `FIRM_PROPOSAL` · `SOFT_HOLD` · pont Acte C |

### Acte C (Scène 3/5 → 4/5)

Bandeau : **Scène 3/5** pendant l’engagement et la préparation ; **Scène 4/5** après « Continuer la démonstration ».

| Route | Écran | Décision |
| ----- | ----- | -------- |
| `/engagement` | 10 — Constater | Séquence visible Inès (accepte → consent → paie) puis preuves consultables |
| `/engagement/preparation` | 11 — Préparer | Checklist Sarah cochable · Inès auto · READY · compression jour J |

### Acte D (Scène 4/5 → 5/5)

Bandeau : **Scène 4/5** pendant la réalisation ; **Scène 5/5** après `COMPLETED` (entrée Acte E).

| Route | Écran | Décision |
| ----- | ----- | -------- |
| `/realisation` | 12 — Dossier du jour | Lecture READY · CTA **Commencer la prestation** → `IN_PROGRESS` |
| `/realisation/en-cours` | 13 — En cours | Modal interruptif perles · évaluer / refuser (récupérable) |
| `/realisation/modification` | 14 — Modification | Micro-choix +10 € / +20 min · séquence Inès · preuves V1/V2 |
| `/realisation/cloture` | 15 — Clôture | Qualification réelle → `COMPLETED` · pont Acte E |

### Acte E (Scène 5/5)

Bandeau : **Scène 5/5** dès l’entrée Acte E (après qualification intégrale).

| Route | Écran | Décision |
| ----- | ----- | -------- |
| `/reglement` | 16 — Règlement | Séquence imputation → solde 130 € → paiement · preuves / frais · `SETTLED` · net 162 € |
| `/reglement/suite` | 17 — Avis & relation | Lecture avis · réponse réelle (ton) · favori immersif · formulaire clôture |

## États produit

**Acte B :** `DEMAND_QUALIFIED` → (clarification) → `DEMAND_ENRICHED` → `FIRM_PROPOSAL` + `SOFT_HOLD`  
Invitation : `INVITATION_ACTIVE` · refus local récupérable · `INVITATION_CONVERTED` après envoi.

**Acte C :** `COMMITTED` + `READINESS_PENDING` → (checklists) → `READY` → `dayJAdvanced`

**Acte D :** `IN_PROGRESS` → (composition + accord) → engagement **V2** → qualification → `COMPLETED`

**Acte E :** séquence règlement → `SETTLED` → `REVIEW_REPLIED` (local) · favori constaté · feedback `RECORDED`

Persistance locale : `demo-precurseur.opportunity` (+ cadre / offre / planning / feedback existants).

## Navigation produit

Accueil · **Opportunités** (reprend l’étape B/C/D/E en cours) · **Rendez-vous** (actif dès jour J) · Prestations · Profil (stub)

## Comment tester l’Acte E

1. Parcourir jusqu’à Acte D `COMPLETED` (qualification « réalisée intégralement ») · bandeau Scène 5/5.
2. **Continuer vers le règlement** → séquence visible (imputation 50 € → solde 130 € → paiement Inès).
3. Constater le récap `SETTLED` · ouvrir preuve de paiement et détail des frais (18 € → net 162 €).
4. **Voir l’avis et la suite** → lire les notes · **Répondre à l’avis** (choisir un ton, ajuster, envoyer).
5. Constater le sheet favori · ouvrir la fiche cliente (lecture).
6. **Terminer cette démonstration** → formulaire (5 requises + libre) · enregistrer · merci · **Recommencer le scénario**.

## Décisions UX tranchées (Acte E)

| # | Choix |
| - | ----- |
| E1 | Séquence paiement visible + preuves / frais consultables (180 / 130 / 18 / 162) |
| E2 | Lecture + réponse réelle (ton / modèle éditable borné + envoi confirmé) |
| E3 | Constat immersif favori + fiche cliente lecture seule |
| E4 | Formulaire clôture allégé (4 choix structurés + artificiel + libre) + merci / recommencer |

## Points ouverts mineurs

- Branche « Tester un incident » : stub (hors happy path).
- Pas de réponse Inès en retour après `REVIEW_REPLIED` (volontaire, storyboard).
