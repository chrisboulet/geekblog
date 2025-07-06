import React from 'react';

interface WorkflowGuideProps {
  projectName: string;
  onStartPlanning: () => void;
}

const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ projectName, onStartPlanning }) => {
  return (
    <div className="neural-card bg-gradient-to-br from-bg-primary to-bg-secondary p-8 text-center max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold neural-text-gradient mb-2">
          Bienvenue dans GeekBlog! 
        </h2>
        <p className="text-text-secondary">
          Votre assistant IA pour créer du contenu de blog de qualité
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="neural-card bg-bg-secondary/50 p-6">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold text-neural-blue mb-2">1. Planification IA</h3>
          <p className="text-sm text-text-secondary">
            L'IA analyse votre projet "<strong>{projectName}</strong>" et crée automatiquement une liste de tâches structurées.
          </p>
        </div>

        <div className="neural-card bg-bg-secondary/50 p-6">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-lg font-semibold text-neural-purple mb-2">2. Workflow Kanban</h3>
          <p className="text-sm text-text-secondary">
            Organisez vos tâches visuellement : À faire → En cours → Révision → Terminé. Déléguez à l'IA chercheur ou rédacteur.
          </p>
        </div>

        <div className="neural-card bg-bg-secondary/50 p-6">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="text-lg font-semibold text-neural-pink mb-2">3. Assemblage Final</h3>
          <p className="text-sm text-text-secondary">
            L'équipe de finition IA (critique, style, fact-check, relecture) polit votre contenu pour un résultat professionnel.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-text-secondary">
          Prêt à commencer ? Cliquez sur "Planifier avec l'IA" pour que l'assistant analyse votre projet et crée vos premières tâches.
        </p>
        
        <button
          onClick={onStartPlanning}
          className="neural-button-primary text-lg px-8 py-3 shadow-neural-glow-blue"
        >
          🚀 Commencer la planification IA
        </button>
        
        <p className="text-xs text-text-tertiary mt-4">
          Conseil : Vous pouvez aussi ajouter des tâches manuellement en cliquant sur "+ Ajouter une tâche" dans chaque colonne.
        </p>
      </div>
    </div>
  );
};

export default WorkflowGuide;