"""
Script pour peupler la base de données avec les templates initiaux
basés sur l'analyse du blog de Christian Boulet.
"""

from sqlalchemy.orm import Session
from app.db.config import SessionLocal
from app.models.models import BlogTemplate


def seed_templates(db: Session):
    """
    Crée les templates initiaux basés sur l'analyse du blog.
    """

    templates = [
        # 1. Guide Pratique Québécois (Priorité #1)
        {
            "name": "Guide Pratique Québécois",
            "slug": "guide-pratique-quebecois",
            "description": "Guide concret avec pièges et astuces, style accessible et québécois",
            "icon": "💡",
            "category": "Guide",
            "difficulty": "Facile",
            "estimated_duration": "2-3h",
            "target_audience": "Débutants pragmatiques",
            "tone": "Pratique",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Situation réelle - Hook engageant",
                        "description": "Commencer par une situation concrète où votre lecteur se trouve",
                    },
                    {
                        "title": "2. Préparation - Ce qu'il faut savoir",
                        "description": "Expliquer ce dont le lecteur aura besoin avant de commencer",
                    },
                    {
                        "title": "3. Étapes concrètes - Guide pas à pas",
                        "description": "Détailler chaque étape avec des transitions claires",
                    },
                    {
                        "title": "4. Pièges à éviter - Votre expérience",
                        "description": "Partager les erreurs courantes et comment les éviter",
                    },
                    {
                        "title": "5. Résultat final - Conclusion pratique",
                        "description": "Résumer le résultat attendu et inviter aux commentaires",
                    },
                ]
            },
            "sample_expressions": {
                "bas": {
                    "opener": "Voici comment",
                    "transition": "Ensuite",
                    "closer": "Au final",
                },
                "moyen": {
                    "opener": "OK, mettons que vous voulez",
                    "transition": "Du coup",
                    "closer": "Au final",
                },
                "élevé": {
                    "opener": "OK, mettons que vous voulez",
                    "transition": "Première affaire",
                    "closer": "Au final, vous devriez avoir",
                },
            },
            "is_active": True,
        },
        # 2. Question Engagement
        {
            "name": "Question Engagement",
            "slug": "question-engagement",
            "description": "Pose une question directe pour engager la communauté geek",
            "icon": "🤔",
            "category": "Opinion",
            "difficulty": "Facile",
            "estimated_duration": "1-2h",
            "target_audience": "Geeks québécois",
            "tone": "Personnel",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Hook Question - Interpellation directe",
                        "description": "Question engageante sur le sujet",
                    },
                    {
                        "title": "2. Contexte actuel - 'En fait, voici ce qui se passe'",
                        "description": "Expliquer la situation qui motive votre question",
                    },
                    {
                        "title": "3. Exploration - 'Du coup, ça soulève plusieurs questions'",
                        "description": "Développer les différents angles du sujet",
                    },
                    {
                        "title": "4. Opinion personnelle - Votre position",
                        "description": "Partager votre point de vue personnel",
                    },
                    {
                        "title": "5. Appel engagement - 'Écrivez-moi!'",
                        "description": "Terminer par un appel direct aux commentaires",
                    },
                ]
            },
            "sample_expressions": {
                "tous": {
                    "hook": "Et vous, qu'est-ce que vous en pensez?",
                    "contexte": "En fait",
                    "transition": "Du coup",
                    "synthese": "Bref",
                    "appel": "Écrivez-moi!",
                }
            },
            "is_active": True,
        },
        # 3. Comparaison Analyse
        {
            "name": "Comparaison Analyse",
            "slug": "comparaison-analyse",
            "description": "Compare deux options avec verdict personnel et recommandation",
            "icon": "📊",
            "category": "Analyse",
            "difficulty": "Moyen",
            "estimated_duration": "2-3h",
            "target_audience": "Geeks indécis",
            "tone": "Analytique",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Setup comparaison - Présentation équilibrée",
                        "description": "Introduire les deux options de manière neutre",
                    },
                    {
                        "title": "2. Option A - Forces et faiblesses",
                        "description": "Analyser la première option en détail",
                    },
                    {
                        "title": "3. Option B - Forces et faiblesses",
                        "description": "Analyser la deuxième option avec la même structure",
                    },
                    {
                        "title": "4. Verdict personnel - 'Voici ce que j'en pense'",
                        "description": "Donner votre recommandation personnelle",
                    },
                    {
                        "title": "5. Recommandation contextuelle - 'Si j'étais vous'",
                        "description": "Adapter la recommandation selon différents profils",
                    },
                ]
            },
            "sample_expressions": {
                "tous": {
                    "intro": "Bon, on va regarder ça ensemble",
                    "verdict": "Voici ce que j'en pense",
                    "conseil": "Si j'étais vous",
                }
            },
            "is_active": True,
        },
        # 4. Alerte Sécurité
        {
            "name": "Alerte Sécurité",
            "slug": "alerte-securite",
            "description": "Alerte urgente avec explications accessibles sur un enjeu de cybersécurité",
            "icon": "🚨",
            "category": "Sécurité",
            "difficulty": "Moyen",
            "estimated_duration": "1-2h",
            "target_audience": "Utilisateurs concernés",
            "tone": "Urgent",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Urgence - 'OK, il faut qu'on se parle'",
                        "description": "Capter l'attention avec l'urgence de la situation",
                    },
                    {
                        "title": "2. Explication technique - 'En gros, voici le problème'",
                        "description": "Vulgariser le problème technique",
                    },
                    {
                        "title": "3. Impact concret - 'Ça veut dire que'",
                        "description": "Expliquer les conséquences réelles",
                    },
                    {
                        "title": "4. Actions - 'Voici ce que vous devez faire'",
                        "description": "Donner des étapes concrètes de protection",
                    },
                    {
                        "title": "5. Suivi - 'Je vous tiens au courant'",
                        "description": "Promettre des mises à jour",
                    },
                ]
            },
            "sample_expressions": {
                "tous": {
                    "urgence": "OK, il faut qu'on se parle",
                    "explication": "En gros, voici le problème",
                    "impact": "Ça veut dire que",
                    "action": "Voici ce que vous devez faire",
                    "suivi": "Je vous tiens au courant",
                }
            },
            "is_active": True,
        },
        # 5. Série Spécialisée
        {
            "name": "Série Spécialisée",
            "slug": "serie-specialisee",
            "description": "Épisode d'une série approfondie sur un sujet tech complexe",
            "icon": "🔍",
            "category": "Série",
            "difficulty": "Avancé",
            "estimated_duration": "3-4h",
            "target_audience": "Passionnés du sujet",
            "tone": "Approfondi",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Retour série - 'Dans les épisodes précédents'",
                        "description": "Rappeler le contexte de la série",
                    },
                    {
                        "title": "2. Focus du jour - 'Aujourd'hui, on regarde'",
                        "description": "Présenter le sujet spécifique de cet épisode",
                    },
                    {
                        "title": "3. Deep dive - 'Creusons ça ensemble'",
                        "description": "Analyse approfondie avec détails techniques",
                    },
                    {
                        "title": "4. Lien global - 'Ça s'inscrit dans'",
                        "description": "Replacer dans le contexte plus large",
                    },
                    {
                        "title": "5. Teaser suite - 'La prochaine fois'",
                        "description": "Annoncer le prochain épisode",
                    },
                ]
            },
            "sample_expressions": {
                "tous": {
                    "rappel": "Dans les épisodes précédents",
                    "focus": "Aujourd'hui, on regarde",
                    "analyse": "Creusons ça ensemble",
                    "contexte": "Ça s'inscrit dans",
                    "teaser": "La prochaine fois",
                }
            },
            "is_active": True,
        },
        # 6. Actualité Tech
        {
            "name": "Actualité Tech",
            "slug": "actualite-tech",
            "description": "Réaction à chaud sur l'actualité technologique avec perspective québécoise",
            "icon": "🎯",
            "category": "Actualité",
            "difficulty": "Facile",
            "estimated_duration": "1h",
            "target_audience": "Veille technologique",
            "tone": "Réactif",
            "localization_level": "moyen",
            "is_boulet_style": True,
            "template_structure": {
                "steps": [
                    {
                        "title": "1. Nouvelle - 'Dernières nouvelles dans le monde tech'",
                        "description": "Présenter la nouvelle de manière accrocheuse",
                    },
                    {
                        "title": "2. Contexte - 'Pour ceux qui suivent pas'",
                        "description": "Donner le contexte nécessaire",
                    },
                    {
                        "title": "3. Analyse - 'Voici pourquoi c'est important'",
                        "description": "Analyser les implications",
                    },
                    {
                        "title": "4. Impact - 'Ça change quoi pour nous?'",
                        "description": "Expliquer l'impact local/personnel",
                    },
                    {
                        "title": "5. Prédiction - 'Je pense que ça va'",
                        "description": "Donner votre prédiction sur l'évolution",
                    },
                ]
            },
            "sample_expressions": {
                "tous": {
                    "nouvelle": "Dernières nouvelles dans le monde tech",
                    "contexte": "Pour ceux qui suivent pas",
                    "analyse": "Voici pourquoi c'est important",
                    "impact": "Ça change quoi pour nous?",
                    "prediction": "Je pense que ça va",
                }
            },
            "is_active": True,
        },
    ]

    # Vérifier si des templates existent déjà
    existing_count = db.query(BlogTemplate).count()
    if existing_count > 0:
        print(f"⚠️  {existing_count} templates existent déjà. Abandon du seed.")
        return

    # Créer les templates
    for template_data in templates:
        template = BlogTemplate(**template_data)
        db.add(template)

    db.commit()
    print(f"✅ {len(templates)} templates créés avec succès!")


def main():
    """
    Point d'entrée du script.
    """
    db = SessionLocal()
    try:
        seed_templates(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
