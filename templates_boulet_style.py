#!/usr/bin/env python3
"""
Templates de contenu basés sur l'analyse du style de Christian Boulet
pour le blog "Les Geeks à Temps Partiel"
"""

from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class BlogTemplate:
    """Template de base pour un article de blog."""
    title_pattern: str
    structure: List[str]
    tone_indicators: List[str]
    typical_length: str
    category: str
    example_tags: List[str]

class BouletStyleTemplates:
    """Collection de templates basés sur le style de Christian Boulet."""
    
    def __init__(self):
        self.templates = self._create_templates()
    
    def _create_templates(self) -> Dict[str, BlogTemplate]:
        """Crée tous les templates basés sur l'analyse."""
        return {
            "question_engagement": BlogTemplate(
                title_pattern="{Technologie/Produit}... oui ou non ?",
                structure=[
                    "Hook : Question directe qui interpelle",
                    "Contexte : Situation actuelle en 1-2 paragraphes",
                    "Enjeux : Points clés à considérer (2-3 points)",
                    "Mon point de vue : 'En fait...', opinion personnelle",
                    "Appel à l'action : 'Écrivez-moi !', invitation aux commentaires"
                ],
                tone_indicators=[
                    "Utiliser 'je', 'mon', 'mes' naturellement",
                    "Questions rhétoriques fréquentes",
                    "Expressions : 'En fait', 'Bref', 'Du coup'",
                    "Référence au contexte québécois si pertinent"
                ],
                typical_length="500-800 mots",
                category="Discussion",
                example_tags=["opinion", "débat", "technologie", "Quebec"]
            ),
            
            "comparaison_analyse": BlogTemplate(
                title_pattern="Comparaison {A} vs {B}",
                structure=[
                    "Introduction : Présentation des deux options",
                    "Points forts de {A} : Avantages identifiés",
                    "Points forts de {B} : Avantages identifiés", 
                    "Limites de chaque option : Analyse critique",
                    "Verdict personnel : Recommandation claire",
                    "Contexte local : Pertinence pour le Québec/Canada"
                ],
                tone_indicators=[
                    "Analyse équilibrée mais avec opinion tranchée",
                    "Vulgarisation des aspects techniques",
                    "Références à l'expérience personnelle",
                    "Pragmatisme québécois"
                ],
                typical_length="600-1000 mots",
                category="Opinion",
                example_tags=["comparaison", "analyse", "technologie", "choix"]
            ),
            
            "actualite_tech": BlogTemplate(
                title_pattern="La nouvelle {technologie}",
                structure=[
                    "Annonce : Le fait marquant",
                    "Ce qui change : Nouveautés principales",
                    "Impact utilisateur : Conséquences concrètes",
                    "Mon avis : Point de vue personnel",
                    "À suivre : 'Plus de détails à venir !'"
                ],
                tone_indicators=[
                    "Enthousiasme contrôlé",
                    "Focus sur l'utilisateur final",
                    "Scepticisme sain sur les promesses marketing",
                    "Références geek/tech naturelles"
                ],
                typical_length="300-600 mots",
                category="Actualités",
                example_tags=["nouvelle", "innovation", "tech", "actualité"]
            ),
            
            "guide_pratique": BlogTemplate(
                title_pattern="Comment {action} {sujet tech}",
                structure=[
                    "Le problème : Situation qui nécessite la solution",
                    "Ma méthode : Approche personnelle testée",
                    "Étapes détaillées : Instructions claires",
                    "Pièges à éviter : Erreurs communes",
                    "Bilan : Retour d'expérience personnel"
                ],
                tone_indicators=[
                    "Pragmatique et accessible",
                    "Partage d'expérience personnelle",
                    "Admissions d'erreurs/apprentissages",
                    "Conseils de 'geek à temps partiel'"
                ],
                typical_length="700-1200 mots",
                category="Informaticien",
                example_tags=["guide", "tutoriel", "méthode", "expérience"]
            ),
            
            "reflexion_tendance": BlogTemplate(
                title_pattern="{Innovation} : Une révolution pour {contexte} ?",
                structure=[
                    "Contexte : Situation actuelle",
                    "La tendance : Ce qui émerge",
                    "Opportunités : Potentiel positif",
                    "Défis : Obstacles et risques",
                    "Vision personnelle : Projection réaliste"
                ],
                tone_indicators=[
                    "Optimisme mesuré",
                    "Analyse des implications sociétales",
                    "Perspective québécoise/canadienne",
                    "Questions sur l'adoption locale"
                ],
                typical_length="800-1200 mots",
                category="En feu !",
                example_tags=["tendance", "innovation", "futur", "société"]
            ),
            
            "securite_alerte": BlogTemplate(
                title_pattern="Attention : {menace} - Comment se protéger ?",
                structure=[
                    "L'alerte : Nature de la menace",
                    "Qui est touché : Cibles potentielles", 
                    "Comment ça fonctionne : Explication accessible",
                    "Protection : Mesures concrètes",
                    "Vigilance : Recommandations continues"
                ],
                tone_indicators=[
                    "Sérieux sans alarmisme",
                    "Explications techniques accessibles",
                    "Conseil professionnel mais humain",
                    "Appel à la prudence raisonnée"
                ],
                typical_length="500-800 mots",
                category="Sécurité informatique",
                example_tags=["sécurité", "alerte", "protection", "cybersécurité"]
            ),
            
            "retour_experience": BlogTemplate(
                title_pattern="Mon expérience avec {produit/service}",
                structure=[
                    "Contexte : Pourquoi j'ai testé",
                    "Premières impressions : Découverte",
                    "Usage réel : Expérience quotidienne",
                    "Points forts : Ce qui m'a plu",
                    "Points faibles : Les déceptions",
                    "Verdict : Recommandation finale"
                ],
                tone_indicators=[
                    "Honnêteté brutale",
                    "Détails d'usage concret",
                    "Comparaison avec alternatives",
                    "Perspective utilisateur 'normal'"
                ],
                typical_length="600-1000 mots", 
                category="Divers",
                example_tags=["test", "expérience", "review", "utilisateur"]
            ),
            
            "serie_vehicules_autonomes": BlogTemplate(
                title_pattern="Véhicules autonomes au Québec : {aspect spécifique}",
                structure=[
                    "Le défi québécois : Spécificités locales",
                    "Où en est la technologie : État actuel",
                    "Adaptation nécessaire : Modifications pour le climat",
                    "Implications économiques : Impact sur le Québec",
                    "Timeline réaliste : Quand ça arrivera vraiment"
                ],
                tone_indicators=[
                    "Expertise technique accessible",
                    "Réalisme québécois sur les défis",
                    "Enthousiasme pour l'innovation",
                    "Préoccupations pratiques (hiver, routes, etc.)"
                ],
                typical_length="800-1500 mots",
                category="Série : Véhicules autonomes", 
                example_tags=["Tesla", "véhicules autonomes", "Quebec", "innovation", "transport"]
            )
        }
    
    def get_template(self, template_type: str) -> BlogTemplate:
        """Récupère un template spécifique."""
        return self.templates.get(template_type)
    
    def list_templates(self) -> List[str]:
        """Liste tous les templates disponibles."""
        return list(self.templates.keys())
    
    def generate_title_suggestions(self, topic: str, template_type: str) -> List[str]:
        """Génère des suggestions de titres basées sur un sujet."""
        template = self.get_template(template_type)
        if not template:
            return []
        
        base_pattern = template.title_pattern
        
        # Suggestions basées sur les patterns identifiés
        suggestions = {
            "question_engagement": [
                f"{topic}... oui ou non ?",
                f"Êtes-vous prêts pour {topic} ?",
                f"{topic} : pour ou contre ?",
                f"Que pensez-vous de {topic} ?",
                f"{topic} : révolution ou effet de mode ?"
            ],
            "comparaison_analyse": [
                f"Comparaison {topic} vs [alternative]",
                f"{topic} : est-il recommandé ?",
                f"{topic} vs la concurrence : mon analyse",
                f"Pourquoi choisir {topic} ?",
                f"{topic} : avantages et inconvénients"
            ],
            "actualite_tech": [
                f"La nouvelle {topic}",
                f"{topic} : ce qui change",
                f"{topic} arrive au Canada !",
                f"Nouveauté : {topic}",
                f"{topic} : première impression"
            ],
            "serie_vehicules_autonomes": [
                f"Véhicules autonomes au Québec : {topic}",
                f"{topic} et conduite autonome : défis hivernaux",
                f"Tesla au Québec : {topic}",
                f"Conduite autonome : {topic} en climat nordique"
            ]
        }
        
        return suggestions.get(template_type, [base_pattern.replace("{topic}", topic)])
    
    def get_content_structure_guide(self, template_type: str) -> Dict[str, Any]:
        """Retourne un guide détaillé pour structurer le contenu."""
        template = self.get_template(template_type)
        if not template:
            return {}
        
        return {
            "template_type": template_type,
            "structure_sections": template.structure,
            "tone_guidelines": template.tone_indicators,
            "target_length": template.typical_length,
            "suggested_category": template.category,
            "recommended_tags": template.example_tags,
            "writing_tips": self._get_writing_tips(template_type)
        }
    
    def _get_writing_tips(self, template_type: str) -> List[str]:
        """Conseils d'écriture spécifiques par type de template."""
        tips = {
            "question_engagement": [
                "Commencer par une question qui fait réfléchir",
                "Utiliser 'En fait' pour introduire son point de vue", 
                "Terminer par un appel à l'interaction",
                "Intégrer son expérience personnelle",
                "Rester accessible sans simplifier à l'excès"
            ],
            "comparaison_analyse": [
                "Présenter les options de façon équitable",
                "Donner son verdict personnel clairement",
                "Contextualiser pour le marché québécois",
                "Utiliser des exemples concrets d'usage",
                "Éviter le jargon marketing"
            ],
            "actualite_tech": [
                "Garder un ton enthousiaste mais réaliste",
                "Expliquer l'impact pour l'utilisateur moyen",
                "Partager sa première réaction personnelle",
                "Éviter de recopier les communiqués",
                "Promettre un suivi : 'Plus de détails à venir !'"
            ],
            "guide_pratique": [
                "Partager ce qui a vraiment fonctionné",
                "Admettre ses erreurs et apprentissages", 
                "Donner des étapes concrètes et testées",
                "Prévenir des pièges courants",
                "Rester humble : 'geek à temps partiel'"
            ],
            "securite_alerte": [
                "Expliquer clairement sans alarmer",
                "Donner des actions concrètes",
                "Vulgariser les aspects techniques",
                "Maintenir un ton professionnel mais humain",
                "Encourager la vigilance sans paranoïa"
            ]
        }
        
        return tips.get(template_type, [
            "Utiliser un ton personnel et accessible",
            "Intégrer l'expérience québécoise",
            "Équilibrer expertise et simplicité",
            "Encourager l'interaction avec les lecteurs"
        ])

# Exemple d'utilisation
def demonstrate_templates():
    """Démonstration des templates Boulet."""
    templates = BouletStyleTemplates()
    
    print("=== TEMPLATES STYLE CHRISTIAN BOULET ===\n")
    
    # Liste des templates
    print("Templates disponibles :")
    for template_name in templates.list_templates():
        print(f"  - {template_name}")
    
    print("\n" + "="*50)
    
    # Exemple détaillé pour un template
    template_type = "question_engagement"
    topic = "Intelligence Artificielle"
    
    print(f"\nExemple : {template_type.replace('_', ' ').title()}")
    print(f"Sujet : {topic}\n")
    
    # Suggestions de titres
    titles = templates.generate_title_suggestions(topic, template_type)
    print("Suggestions de titres :")
    for title in titles:
        print(f"  • {title}")
    
    print()
    
    # Guide de structure
    guide = templates.get_content_structure_guide(template_type)
    print("Structure recommandée :")
    for i, section in enumerate(guide["structure_sections"], 1):
        print(f"  {i}. {section}")
    
    print(f"\nTon à adopter :")
    for tip in guide["tone_guidelines"]:
        print(f"  • {tip}")
    
    print(f"\nLongueur cible : {guide['target_length']}")
    print(f"Catégorie : {guide['suggested_category']}")
    print(f"Tags suggérés : {', '.join(guide['recommended_tags'])}")

if __name__ == "__main__":
    demonstrate_templates()