# Mémoire V2 - Guide de Style & Décisions de Conception

Ce document capture l'identité visuelle et les principes de conception de l'interface "Neural Flow".

## Philosophie de Conception

L'interface doit être **immersive, réactive et futuriste**. Elle doit donner à l'utilisateur le sentiment d'être dans un "cockpit" ou un "centre de commandement". L'esthétique est sombre, avec des accents de couleurs "neurales" (violets, bleus, roses) pour créer des contrastes et guider l'attention.

Les animations et les transitions doivent être fluides et significatives, renforçant l'idée d'un "flux" d'informations.

## Système de Design "Neural Flow"

L'implémentation est basée sur **Tailwind CSS**, mais utilise un système de variables CSS pour garantir la cohérence.

### Couleurs

-   **Fonds :** Une palette de noirs et de gris très sombres (`--bg-primary`, `--bg-secondary`) pour créer une atmosphère immersive.
-   **Accents Neurals :** Des couleurs vives (`--neural-purple`, `--neural-pink`, `--neural-blue`) utilisées pour les éléments interactifs, les indicateurs et les effets de lueur.
-   **Texte :** Une hiérarchie claire avec du blanc pour le texte principal (`--text-primary`) et des gris pour le texte secondaire et tertiaire.

### Effets Visuels

-   **Transparence ("Glassmorphism") :** Les panneaux et les modales utilisent un fond semi-transparent avec un flou d'arrière-plan (`--bg-glass`), donnant une impression de profondeur.
-   **Lueur ("Glow") :** Les éléments importants ou survolés émettent une lueur subtile (`--glow-md`, `--shadow-neural`), renforçant le thème futuriste.
-   **Animations :**
    -   `pulse` : Utilisée pour attirer l'attention sur des éléments actifs.
    -   `particleFloat` : Crée un arrière-plan animé subtil qui évoque un flux de données.
    -   Transitions `ease-out` : Utilisées pour toutes les interactions afin de garantir des animations douces et naturelles.

## Décisions sur les Composants Clés

-   **Kanban :** Le cœur de l'interface. Les colonnes sont sombres et semi-transparentes. Les cartes de tâches (`TaskCard`) reprennent le style des "nœuds neuraux" avec des bordures colorées et des effets de survol.
-   **Éditeur de Texte :** L'éditeur (`RichTextEditor` basé sur Tiptap) est conçu pour être "headless" et s'intégrer parfaitement. Il n'a pas de style propre, mais hérite de la configuration `prose` de Tailwind, elle-même personnalisée pour correspondre à notre thème.
-   **Boutons et Contrôles :** Les boutons sont arrondis ("pill-shaped") ou circulaires pour les icônes. Ils utilisent des dégradés subtils et des ombres portées pour se détacher de l'arrière-plan.
-   **Composants UI de Base :** La décision a été prise d'utiliser **Radix UI** (via `shadcn/ui`) comme fondation pour les composants complexes (Dropdowns, Dialogs) afin de garantir une accessibilité et une robustesse maximales, tout en les stylisant pour qu'ils correspondent à notre thème.

Ce guide de style est le garant de la cohérence visuelle de l'application. Toute nouvelle fonctionnalité ou composant doit s'y conformer strictement.
