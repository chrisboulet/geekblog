# METHOD_TASK.md - Méthode de Gestion des Tâches GeekBlog

## Vue d'Ensemble

Ce document définit la méthode structurée de gestion des tâches pour le projet GeekBlog, conçue pour maintenir la clarté, la traçabilité et l'efficacité dans le développement.

## Structure des Fichiers

```
📁 /
├── 📄 METHOD_TASK.md      # Ce fichier - Explique la méthode
├── 📄 PLANNING.md         # Vision stratégique et architecture
├── 📄 TASK.md            # Tâches générales du projet
├── 📄 MITIGATION_PLAN.md # Plans spécifiques de mitigation
├── 📄 NEXT_TASKS.md      # Prochaines actions immédiates (5-10 items)
└── 📄 HISTORY.md         # Historique des changements importants
```

## Workflow de Gestion

### 1. Planification Stratégique (PLANNING.md)
- Vision à long terme
- Architecture et patterns
- Objectifs majeurs
- Standards de qualité

### 2. Plans Spécifiques (MITIGATION_PLAN.md)
- Plans détaillés pour des initiatives majeures
- Phases structurées avec actions concrètes
- Critères de succès mesurables
- Dépendances et séquencement

### 3. Tâches Actives (TASK.md)
- Liste des tâches en cours
- Statut et priorités
- Découvertes pendant le travail
- Références aux plans spécifiques

### 4. Actions Immédiates (NEXT_TASKS.md)
- 5-10 prochaines actions concrètes
- Mise à jour quotidienne
- Focus sur l'exécution
- Références aux phases du plan

### 5. Historique (HISTORY.md)
- Journal des changements majeurs
- Décisions importantes
- Leçons apprises
- Métriques de succès

## Conventions

### Priorités
- 🔴 **CRITIQUE**: Bloquant ou urgent
- 🟠 **HAUTE**: Important, à faire rapidement
- 🟡 **MOYENNE**: Normal, planifié
- 🟢 **BASSE**: Nice to have, quand possible

### Statuts
- ⏳ **PENDING**: En attente
- 🚧 **IN_PROGRESS**: En cours
- ✅ **COMPLETED**: Terminé
- ❌ **CANCELLED**: Annulé
- 🔄 **BLOCKED**: Bloqué

### Format des Tâches
```markdown
- [x] **Titre de la tâche** (STATUT YYYY-MM-DD)
  - Description détaillée
  - Critères de succès
  - Référence: MITIGATION_PLAN.md#phase-1-action-1.1
```

## Cycle de Mise à Jour

### Quotidien
1. Consulter NEXT_TASKS.md
2. Mettre à jour le statut dans TASK.md
3. Ajouter découvertes/blocages
4. Régénérer NEXT_TASKS.md pour le lendemain

### Hebdomadaire
1. Revue du MITIGATION_PLAN.md
2. Mise à jour des phases complétées
3. Ajustement des priorités
4. Mise à jour HISTORY.md avec accomplissements

### Mensuel
1. Revue stratégique PLANNING.md
2. Analyse des métriques
3. Planification du prochain cycle
4. Archivage des tâches complétées

## Intégration avec Claude

### Au début de chaque session
```markdown
1. Lire NEXT_TASKS.md pour le contexte immédiat
2. Vérifier TASK.md pour les statuts actuels
3. Consulter MITIGATION_PLAN.md pour la phase en cours
```

### Pendant le travail
```markdown
1. Mettre à jour le statut des tâches en temps réel
2. Documenter les découvertes importantes
3. Créer de nouvelles tâches si nécessaire
4. Référencer les sections spécifiques des plans
```

### En fin de session
```markdown
1. Mettre à jour tous les statuts
2. Régénérer NEXT_TASKS.md
3. Ajouter entrée dans HISTORY.md si milestone atteint
4. Commit avec message descriptif
```

## Avantages de cette Méthode

1. **Clarté**: Séparation claire entre stratégie, planification et exécution
2. **Focus**: NEXT_TASKS.md permet de se concentrer sur l'immédiat
3. **Traçabilité**: Historique complet des décisions et changements
4. **Flexibilité**: Plans peuvent évoluer sans perdre la vision
5. **Efficacité**: Moins de temps perdu à chercher quoi faire

## Maintenance

- Nettoyer TASK.md mensuellement (archiver les complétées)
- Réviser METHOD_TASK.md trimestriellement
- Backup HISTORY.md avant archivage annuel
- Garder NEXT_TASKS.md concis (max 10 items)

---

*Dernière mise à jour: 2025-07-13*
*Version: 1.0*
