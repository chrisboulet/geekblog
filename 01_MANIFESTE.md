# Mémoire V2 - Le Manifeste du "Content Command Center"

## Vision du Produit

La vision fondamentale de ce projet est de créer un **centre de commandement pour la production de contenu**, agissant comme un "multiplicateur de force" pour un créateur solo ou une petite équipe. L'objectif n'est pas de créer un simple éditeur de texte, mais un écosystème intégré où la collaboration Homme-IA transforme radicalement le processus de création.

## Problème à Résoudre

La création de contenu de haute qualité est un processus lent, laborieux et fragmenté. Il implique de nombreuses étapes répétitives (recherche, structuration, rédaction, révision, correction) qui sont des goulots d'étranglement. Les outils actuels sont passifs ; ils aident à organiser, mais ne participent pas activement au travail.

Notre solution vise à résoudre ce problème en transformant le processus d'une série de tâches manuelles en un **workflow fluide et interactif**, où l'IA n'est pas un simple outil, mais un co-équipier proactif.

## Concepts Fondamentaux

-   **Le Projet :** L'unité de travail centrale, représentant un article de blog de l'idée à la publication.
-   **La Tâche :** L'unité de travail atomique. Un projet est une collection de tâches (ex: "Faire une recherche", "Rédiger l'introduction", "Vérifier les sources").
-   **L'Agent (Humain ou IA) :** L'entité qui exécute une tâche.
-   **Le "Flow" :** Le processus dynamique par lequel les tâches se déplacent à travers différents états et sont prises en charge par différents agents, le tout visualisé sur un tableau Kanban.

## Le Workflow Collaboratif Homme-IA

Le cœur de l'innovation réside dans le workflow asynchrone et réactif :

1.  **Planification Assistée :** L'utilisateur fournit une idée, et un **Agent Planificateur** la décompose en un plan de tâches structuré avec suivi de progression en temps réel.
2.  **Délégation Intelligente :** L'utilisateur peut basculer entre mode synchrone et asynchrone, déléguer des tâches aux agents IA spécialisés (Chercheur, Rédacteur) avec indicateurs de progression visuels et possibilité d'annulation.
3.  **Exécution Transparente :** L'IA exécute les tâches en arrière-plan avec polling automatique, barres de progression, et notifications de statut. L'interface reste responsive pendant les opérations longues (60-300 secondes).
4.  **Feedback Visuel Continu :** Composants de statut en temps réel (JobProgressBar, JobStatusBadge) avec thème neural pour suivre l'avancement de chaque opération IA.
5.  **Cycle de Révision Humaine :** Le résultat de l'IA est présenté à l'utilisateur pour validation avec historique complet des étapes. Il peut l'accepter, le modifier dans un éditeur intégré, ou le rejeter.
6.  **Assemblage et Raffinage Final :** Les tâches terminées sont assemblées dans un ordre défini par l'utilisateur. Une **"Équipe de Finition" IA** (Critique, Styleur, Correcteur, Vérificateur) prend alors le relais pour polir l'article avec suivi de progression complet.

Ce manifeste représente la "Loi Fondamentale" du projet, le document de référence qui doit guider toutes les décisions techniques et de conception futures.
