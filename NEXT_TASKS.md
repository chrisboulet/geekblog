# NEXT_TASKS.md - Prochaines Actions Immédiates

**Dernière mise à jour**: 2025-07-13
**Focus actuel**: Phase 2 M2 - Standardisation Styling HomePage.tsx

---

## Actions Immédiates (5-10 prochaines tâches)

### 🔴 CRITIQUE - À faire aujourd'hui

1. **[PHASE 1] ✅ COMPLETED - Performance NavigationHeader**
   - ✅ METHOD_TASK.md + MITIGATION_PLAN.md créés
   - ✅ Baseline performance + DevTools setup
   - ✅ Extraction CSS-in-JS → NavigationHeader.module.css
   - ✅ 53% réduction code + 50% amélioration performance
   - ✅ Frontend Docker opérationnel + validation visuelle

2. **[PHASE 2] Préparer standardisation HomePage.tsx**
   - ⏳ Analyser 15 styles inline identifiés (lignes 80-83, 179-182)
   - ⏳ Créer baseline performance HomePage
   - ⏳ Setup HomePage.module.css suivant pattern établi
   - Référence: MITIGATION_PLAN.md#phase-2-action-2.1

### 🟠 HAUTE - Cette semaine

3. **[PHASE 1] Extraction CSS-in-JS → CSS Modules**
   - ⏳ Créer `/src/styles/components/NavigationHeader.module.css`
   - ⏳ Extraire lignes 122-264 de NavigationHeader.tsx
   - ⏳ Préserver variables `var(--neural-*)`
   - ⏳ Tests visuels comparaison avant/après
   - Référence: MITIGATION_PLAN.md#phase-1-action-1.1

4. **[PHASE 1] Optimisation performance NavigationHeader**
   - ⏳ Grouper media queries dans module CSS
   - ⏳ Ajouter `will-change: transform` pour animations
   - ⏳ Mesurer amélioration performance >50%
   - Référence: MITIGATION_PLAN.md#phase-1-action-1.2

5. **[PHASE 2] Préparer standardisation HomePage**
   - ⏳ Analyser styles inline HomePage.tsx (lignes 80-83, 179-182)
   - ⏳ Planifier conversion vers CSS Modules
   - ⏳ Identifier variables CSS à centraliser
   - Référence: MITIGATION_PLAN.md#phase-2-action-2.1

### 🟡 MOYENNE - Semaine prochaine

6. **[SETUP] Créer scripts automatisation**
   - ⏳ Script benchmark performance automatisé
   - ⏳ Script validation visuelle (screenshots)
   - ⏳ Setup Webpack Bundle Analyzer
   - Référence: MITIGATION_PLAN.md#phase-6-action-6.1

7. **[PHASE 3] Audit sécurité locale**
   - ⏳ Analyser configuration CORS actuelle app/main.py
   - ⏳ Lister endpoints à sécuriser
   - ⏳ Préparer validation input frontend
   - Référence: MITIGATION_PLAN.md#phase-3

### 🟢 BASSE - Quand possible

8. **[DOCUMENTATION] Créer guides développement**
   - ⏳ Guide "Comment ajouter nouveau composant"
   - ⏳ Checklist pré-commit personnalisée
   - ⏳ Process validation UX futures modifications
   - Référence: MITIGATION_PLAN.md#phase-7-action-7.2

---

## Contexte & Références

### Plan Principal
- 📄 **MITIGATION_PLAN.md**: Plan complet 7 phases
- 📄 **METHOD_TASK.md**: Méthode de gestion
- 📄 **TASK.md**: Tâches générales projet

### Phase Actuelle
**PHASE 1 - Performance Critique**: Résoudre CSS-in-JS massif NavigationHeader

### Metrics de Succès Phase 1
- ✅ Temps render NavigationHeader réduit >50%
- ✅ Aucune régression visuelle
- ✅ CSS externalisé et réutilisable

### Dependencies
- React DevTools Profiler installé
- Webpack Bundle Analyzer configuré
- Git branches pour rollback si nécessaire

---

## Notes & Découvertes

*Espace pour noter découvertes importantes pendant l'exécution*

### 2025-07-13
- Plan de mitigation validé et documenté
- Méthode de gestion des tâches établie
- Prêt pour Phase 1 performance critique

---

*Fichier mis à jour automatiquement après chaque session*
*Garder concis (max 10 items)*
