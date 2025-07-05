import os
from typing import Optional # Ajout de l'import Optional
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Charger les variables d'environnement
load_dotenv()
from langchain_groq import ChatGroq
# Désactiver temporairement les outils de recherche pour éviter les erreurs de validation
# TODO: Implémenter les outils de recherche compatibles avec CrewAI 0.140.0
search_tool = None
print("Search tools disabled temporarily. AI features will work without web search.")

# Configuration du LLM (Groq dans cet exemple)
# Assurez-vous que GROQ_API_KEY est défini dans vos variables d'environnement
try:
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama3-8b-8192", # ou llama3-70b-8192 pour plus de puissance
        temperature=0.7
    )
except Exception as e:
    print(f"Erreur lors de l'initialisation du LLM Groq: {e}")
    print("Veuillez vérifier que GROQ_API_KEY est bien configuré.")
    llm = None # Mettre à None pour éviter les erreurs si la clé n'est pas là

# L'outil search_tool est défini ci-dessus lors de l'import

# --- Agent Planificateur (déjà défini) ---
planner_agent = Agent(
    role="Planificateur de Contenu Expert",
    goal="Décomposer un objectif de contenu principal en une liste de tâches actionnables, claires et concises pour la création d'un article de blog.",
    backstory=(
        "Vous êtes un stratège de contenu chevronné avec une expertise dans la décomposition de sujets complexes "
        "en plans structurés. Votre force réside dans l'identification des étapes logiques nécessaires "
        "pour produire un contenu complet et engageant. Vous vous concentrez sur la création de titres de tâches "
        "qui sont auto-explicatifs et mènent à des actions spécifiques."
    ),
    verbose=True,
    allow_delegation=False, # Ce planificateur ne délègue pas, il produit le plan.
    llm=llm # Utiliser le LLM configuré
)

def create_planning_task(project_goal: str) -> Task:
    """Crée une tâche pour l'agent planificateur."""
    return Task(
        description=(
            f"Objectif principal du projet de contenu: '{project_goal}'.\n"
            "Votre mission est de générer une liste de titres de tâches nécessaires pour créer un article de blog basé sur cet objectif. "
            "Chaque titre de tâche doit être formulé comme une action claire et concise (par exemple, 'Rédiger l'introduction sur X', 'Rechercher des statistiques sur Y', 'Analyser les avantages de Z'). "
            "Ne numérotez pas les tâches. Retournez uniquement la liste des titres de tâches, chaque titre sur une nouvelle ligne. "
            "Ne fournissez aucune introduction, conclusion ou autre texte superflu. Juste la liste des titres."
            "Assurez-vous que les tâches couvrent la recherche, la structuration, la rédaction des sections principales, et une phase de révision/correction."
            "Par exemple, si l'objectif est 'Expliquer les bases de l'IA générative', les tâches pourraient être:\n"
            "- Définir ce qu'est l'IA générative\n"
            "- Rechercher les modèles d'IA générative populaires\n"
            "- Rédiger la section sur le fonctionnement de l'IA générative\n"
            "- Lister les applications concrètes de l'IA générative\n"
            "- Discuter des défis et limites de l'IA générative\n"
            "- Rédiger une conclusion percutante\n"
            "- Relire et corriger l'ensemble de l'article"
        ),
        expected_output=(
            "Une liste de titres de tâches, chaque titre sur une nouvelle ligne. Exemple:\n"
            "Titre de la tâche 1\n"
            "Titre de la tâche 2\n"
            "Titre de la tâche 3"
        ),
        agent=planner_agent
    )

def run_planning_crew(project_goal: str) -> list[str]:
    """Exécute le crew de planification et retourne une liste de titres de tâches."""
    if not llm:
        raise EnvironmentError("LLM non initialisé. Vérifiez la configuration de GROQ_API_KEY.")

    planning_task_instance = create_planning_task(project_goal)

    planning_crew = Crew(
        agents=[planner_agent],
        tasks=[planning_task_instance],
        process=Process.sequential,
        verbose=2 # Niveau de verbosité pour le logging du crew
    )

    result = planning_crew.kickoff()

    if isinstance(result, str):
        # Nettoyer le résultat: séparer par ligne et enlever les lignes vides
        task_titles = [title.strip() for title in result.split('\n') if title.strip()]
        # Enlever les éventuels tirets ou numérotations en début de ligne
        task_titles = [title.lstrip('-*. ') for title in task_titles]
        return task_titles
    else:
        print(f"Résultat inattendu du crew de planification: {result}")
        return []

# --- Agent Chercheur ---
researcher_agent = Agent(
    role="Chercheur Expert du Web",
    goal="Trouver et synthétiser des informations pertinentes et à jour sur un sujet donné en utilisant des sources web fiables.",
    backstory=(
        "Vous êtes un spécialiste de la recherche d'informations, capable de naviguer sur le web pour extraire "
        "des données clés, des statistiques, des arguments et des exemples concrets. Vous savez évaluer la fiabilité "
        "des sources et fournir un résumé concis et exploitable des informations trouvées."
    ),
    verbose=True,
    allow_delegation=False,
    tools=[search_tool] if search_tool else [], # Outil de recherche web si disponible
    llm=llm
)

def create_research_task(task_title: str, research_context: Optional[str] = None) -> Task:
    """Crée une tâche pour l'agent chercheur."""
    description = f"Sujet de recherche: '{task_title}'. "
    if research_context:
        description += f"\nContexte supplémentaire ou instructions spécifiques: '{research_context}'"

    description += (
        "\nVotre mission est d'effectuer une recherche approfondie sur ce sujet et de fournir un résumé des points clés, "
        "des faits importants, des statistiques pertinentes et/ou des exemples illustratifs. "
        "Structurez votre réponse de manière claire et concise. Citez vos sources si possible (URL)."
        "Le résultat doit être directement utilisable pour la rédaction de contenu."
    )
    return Task(
        description=description,
        expected_output=(
            "Un résumé textuel des informations trouvées, incluant les points clés, faits, statistiques et exemples. "
            "Les sources (URL) doivent être listées à la fin si possible."
        ),
        agent=researcher_agent
    )

def run_research_crew(task_title: str, research_context: Optional[str] = None) -> str:
    """Exécute le crew de recherche et retourne le résultat textuel."""
    if not llm:
        raise EnvironmentError("LLM non initialisé. Vérifiez la configuration de GROQ_API_KEY.")

    research_task_instance = create_research_task(task_title, research_context)

    research_crew = Crew(
        agents=[researcher_agent],
        tasks=[research_task_instance],
        process=Process.sequential,
        verbose=2
    )

    result = research_crew.kickoff()
    return result if isinstance(result, str) else str(result)


# --- Agent Rédacteur ---
writer_agent = Agent(
    role="Rédacteur de Contenu Polyvalent",
    goal="Rédiger un texte clair, engageant et bien structuré sur un sujet donné, en se basant sur des informations fournies ou un contexte spécifique.",
    backstory=(
        "Vous êtes un rédacteur talentueux capable d'adapter votre style à différents besoins. Vous pouvez rédiger des introductions, "
        "des sections de développement, des conclusions, ou même des articles complets. Vous portez une attention particulière "
        "à la clarté, à la fluidité du texte et à l'engagement du lecteur."
    ),
    verbose=True,
    allow_delegation=False, # Pourrait déléguer à un chercheur si besoin, mais on le gère séparément pour l'instant
    llm=llm
)

def create_writing_task(task_title: str, writing_context: Optional[str] = None) -> Task:
    """Crée une tâche pour l'agent rédacteur."""
    description = f"Sujet de rédaction: '{task_title}'.\n"
    if writing_context:
        description += f"Contexte, informations clés ou instructions spécifiques pour la rédaction:\n'''\n{writing_context}\n'''\n"

    description += (
        "Votre mission est de rédiger un texte sur ce sujet. Le texte doit être bien structuré, clair et engageant. "
        "Adaptez le ton et le style si des instructions spécifiques sont fournies dans le contexte. "
        "Produisez un contenu directement utilisable. Si le sujet est 'Rédiger l'introduction', assurez-vous que le texte est une introduction."
        "Si le sujet est 'Conclusion', rédigez une conclusion."
    )
    return Task(
        description=description,
        expected_output=(
            "Un texte rédigé (paragraphe, section, ou article court) sur le sujet demandé, "
            "prêt à être intégré dans un contenu plus large."
        ),
        agent=writer_agent
    )

def run_writing_crew(task_title: str, writing_context: Optional[str] = None) -> str:
    """Exécute le crew de rédaction et retourne le texte produit."""
    if not llm:
        raise EnvironmentError("LLM non initialisé. Vérifiez la configuration de GROQ_API_KEY.")

    writing_task_instance = create_writing_task(task_title, writing_context)

    writing_crew = Crew(
        agents=[writer_agent],
        tasks=[writing_task_instance],
        process=Process.sequential,
        verbose=2
    )

    result = writing_crew.kickoff()
    return result if isinstance(result, str) else str(result)

# --- Crew de Finition ---

# Agent Critique
critic_agent = Agent(
    role="Critique de Contenu Constructif",
    goal=(
        "Analyser un article de blog assemblé pour identifier les faiblesses structurelles, les incohérences logiques, "
        "les manques d'informations clés, et les opportunités d'amélioration du flux et de l'engagement."
    ),
    backstory=(
        "Vous êtes un éditeur expérimenté avec un œil aiguisé pour les détails et la vue d'ensemble. "
        "Votre objectif n'est pas de réécrire, mais de fournir des critiques actionnables et spécifiques "
        "qui aideront à élever la qualité du texte. Vous êtes direct mais toujours constructif."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# Agent Style
style_agent = Agent(
    role="Maître du Style et de la Réécriture",
    goal=(
        "Réécrire et améliorer le style d'un article de blog en se basant sur les critiques fournies, "
        "pour le rendre plus percutant, fluide, engageant et adapté au public cible. "
        "Améliorer la clarté, la concision et l'impact du texte."
    ),
    backstory=(
        "Vous êtes un virtuose des mots, capable de transformer un texte brut en une œuvre captivante. "
        "Vous comprenez l'importance du ton, du rythme et du choix des mots. Vous travaillez en étroite collaboration "
        "avec le critique pour adresser spécifiquement les points soulevés."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# Agent Vérificateur de Faits
fact_checker_agent = Agent(
    role="Vérificateur de Faits Méticuleux",
    goal=(
        "Vérifier l'exactitude des faits, chiffres, statistiques, dates, et noms propres présentés dans un article de blog, "
        "en utilisant des outils de recherche web. Identifier et signaler toute information incorrecte ou douteuse."
    ),
    backstory=(
        "Vous êtes un détective de l'information, obsédé par la précision. Vous ne laissez aucune affirmation non vérifiée. "
        "Vous utilisez des outils de recherche de manière efficace pour valider chaque information quantifiable ou factuelle. "
        "Votre travail garantit la crédibilité du contenu."
    ),
    verbose=True,
    allow_delegation=False,
    tools=[search_tool] if search_tool else [],
    llm=llm
)

# Agent Correcteur
proofreader_agent = Agent(
    role="Correcteur Orthographique et Grammatical Impitoyable",
    goal=(
        "Éliminer toutes les erreurs d'orthographe, de grammaire, de ponctuation, de syntaxe et de typographie "
        "d'un article de blog pour garantir une présentation impeccable."
    ),
    backstory=(
        "Vous avez un œil de lynx pour la moindre coquille. Aucune erreur ne vous échappe. "
        "Vous êtes le dernier rempart avant la publication, assurant que le texte est parfait sur le plan linguistique."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def create_refinement_tasks(raw_article_content: str) -> list[Task]:
    """Crée la séquence de tâches pour le Crew de Finition."""

    critique_task = Task(
        description=(
            f"Voici un article de blog brut assemblé à partir de plusieurs contributions:\n\n'''\n{raw_article_content}\n'''\n\n"
            "Votre mission est de lire attentivement cet article et de fournir une critique constructive. "
            "Identifiez au moins 3 à 5 points spécifiques d'amélioration concernant: "
            "1. La structure globale et la fluidité entre les sections. "
            "2. La clarté des arguments et des explications. "
            "3. La pertinence et la profondeur des informations (y a-t-il des manques ?). "
            "4. L'engagement du lecteur (introduction, conclusion, exemples, ton). "
            "Ne réécrivez pas l'article, fournissez seulement votre analyse critique sous forme de liste à puces."
        ),
        expected_output="Une liste à puces de critiques constructives et actionnables (minimum 3-5 points).",
        agent=critic_agent
    )

    styling_task = Task(
        description=(
            "L'article suivant a été assemblé et une critique a été formulée (voir contexte de la tâche précédente si disponible). "
            "Votre mission est de réécrire et d'améliorer le style de l'article brut fourni ci-dessous, en tenant compte des critiques (si fournies dans le contexte). "
            "Concentrez-vous sur: la fluidité, la clarté, la concision, le ton (rendre le plus engageant possible), et la force des arguments. "
            "Assurez-vous que le texte final est cohérent et agréable à lire. "
            f"Voici l'article brut à améliorer:\n\n'''\n{raw_article_content}\n'''\n\n"
            "Le texte critique, s'il est disponible dans le contexte de la tâche précédente, doit guider vos améliorations."
        ),
        expected_output="L'article complet, réécrit avec un style amélioré, plus engageant et percutant.",
        agent=style_agent,
        context=[critique_task] # Le styliste dépend de la critique
    )

    fact_checking_task = Task(
        description=(
            "L'article suivant a été révisé stylistiquement (voir contexte de la tâche précédente). "
            "Votre mission est de vérifier méticuleusement tous les faits, chiffres, statistiques, dates, et noms propres mentionnés dans cet article. "
            "Utilisez l'outil de recherche web pour valider chaque information. "
            "Si vous trouvez des informations incorrectes ou douteuses, corrigez-les directement dans le texte ou signalez-les clairement si une reformulation majeure est nécessaire. "
            "Le but est d'avoir un texte factuellement exact."
            # Le contenu de l'article stylisé sera passé par le crew via le contexte de la tâche `styling_task`
        ),
        expected_output=(
            "L'article complet avec les faits vérifiés et corrigés. "
            "Si des corrections ont été apportées, elles doivent être intégrées directement dans le texte. "
            "Si une information n'a pas pu être vérifiée ou est très douteuse, elle peut être signalée par un commentaire comme [Vérification nécessaire: ...]."
        ),
        agent=fact_checker_agent,
        context=[styling_task] # Le fact-checker travaille sur le texte stylisé
    )

    proofreading_task = Task(
        description=(
            "L'article suivant a été révisé stylistiquement et les faits ont été vérifiés (voir contexte de la tâche précédente). "
            "Votre mission finale est d'effectuer une relecture minutieuse pour corriger toutes les erreurs restantes "
            "d'orthographe, de grammaire, de ponctuation, de syntaxe et de typographie. "
            "Assurez-vous que le texte est impeccable avant publication."
            # Le contenu de l'article vérifié sera passé par le crew via le contexte de la tâche `fact_checking_task`
        ),
        expected_output="L'article final, parfaitement corrigé au niveau linguistique, sans aucune faute.",
        agent=proofreader_agent,
        context=[fact_checking_task] # Le correcteur travaille sur le texte vérifié
    )

    return [critique_task, styling_task, fact_checking_task, proofreading_task]

def run_finishing_crew(raw_article_content: str) -> str:
    """Exécute le Crew de Finition sur un contenu d'article brut."""
    if not llm:
        raise EnvironmentError("LLM non initialisé. Vérifiez la configuration de GROQ_API_KEY.")
    if not raw_article_content.strip():
        return "Le contenu de l'article est vide. Rien à raffiner."

    refinement_tasks_instances = create_refinement_tasks(raw_article_content)

    finishing_crew = Crew(
        agents=[critic_agent, style_agent, fact_checker_agent, proofreader_agent],
        tasks=refinement_tasks_instances,
        process=Process.sequential, # Les tâches s'exécutent en séquence
        verbose=2
    )

    # Le résultat final du crew séquentiel est le résultat de la dernière tâche
    final_refined_article = finishing_crew.kickoff()

    return final_refined_article if isinstance(final_refined_article, str) else str(final_refined_article)


if __name__ == '__main__':
    # Test local (nécessite que GROQ_API_KEY soit dans l'environnement)
    if not os.getenv("GROQ_API_KEY"):
        print("GROQ_API_KEY n'est pas configurée. Veuillez la définir pour tester.")
    else:
        sample_goal = "Expliquer les avantages de Tailwind CSS pour le développement frontend."
        print(f"Lancement du test de planification pour l'objectif: '{sample_goal}'")
        try:
            generated_tasks = run_planning_crew(sample_goal)
            if generated_tasks:
                print("\n--- Tâches Générées ---")
                for task_title in generated_tasks:
                    print(task_title)
            else:
                print("Aucune tâche n'a été générée.")
        except Exception as e:
            print(f"Erreur lors du test: {e}")
