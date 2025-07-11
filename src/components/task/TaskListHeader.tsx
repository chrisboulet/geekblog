import React from 'react';
import { Project } from '../../types/api';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import * as aiService from '../../services/aiService';
import { useToastActions } from '../ui/Toast';

interface TaskListHeaderProps {
  project: Project;
  onPlanningComplete?: () => void;
}

const TaskListHeader: React.FC<TaskListHeaderProps> = ({ 
  project, 
  onPlanningComplete 
}) => {
  const toast = useToastActions();

  // AI Planning async operation
  const aiPlanning = useAsyncOperation(
    async (goal: string) => {
      return await aiService.planProjectAsync(project.id, goal);
    },
    {
      onSuccess: () => {
        toast.success('Planification IA terminée avec succès !');
        onPlanningComplete?.();
      },
      onError: (error) => {
        toast.error(`Erreur lors de la planification: ${error}`);
      },
      invalidateQueries: [['projects'], ['projects', project.id.toString()]]
    }
  );

  const handleStartPlanning = () => {
    if (!project.description) {
      toast.warning('Ajoutez une description au projet avant de lancer la planification IA');
      return;
    }
    aiPlanning.execute(project.description);
  };

  const handleRePlan = () => {
    if (!project.description) {
      toast.warning('Ajoutez une description au projet avant de relancer la planification IA');
      return;
    }
    aiPlanning.execute(project.description);
  };

  const getStatusIcon = () => {
    switch (project.planning_status) {
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-sm">Planification en cours...</span>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-2 text-green-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Planification terminée</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center space-x-2 text-red-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Planification échouée</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    // Si une planification est en cours (via ce composant ou autre)
    if (aiPlanning.isExecuting || project.planning_status === 'IN_PROGRESS') {
      return (
        <div className="flex items-center space-x-3">
          {aiPlanning.isExecuting && (
            <div className="flex flex-col items-end text-sm text-text-tertiary">
              <span>Progression: {aiPlanning.progress}%</span>
              {aiPlanning.step && <span className="text-xs">{aiPlanning.step}</span>}
            </div>
          )}
          <button
            onClick={aiPlanning.cancel}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-md text-sm font-medium hover:bg-red-500/30 transition-all duration-150"
          >
            Annuler
          </button>
        </div>
      );
    }

    // Actions selon l'état de planification
    switch (project.planning_status) {
      case 'NOT_STARTED':
        return (
          <button
            onClick={handleStartPlanning}
            disabled={!project.description}
            className="px-4 py-2 bg-neural-blue/20 text-neural-blue border border-neural-blue rounded-md text-sm font-medium hover:bg-neural-blue/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🤖 Planifier avec IA
          </button>
        );

      case 'COMPLETED':
        const hasAiTasks = project.tasks.some(task => task.created_by_ai);
        return (
          <div className="flex items-center space-x-2">
            {hasAiTasks && (
              <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded-full text-xs font-medium">
                {project.tasks.filter(task => task.created_by_ai).length} tâches IA
              </span>
            )}
            <button
              onClick={handleRePlan}
              className="px-4 py-2 bg-neural-blue/10 text-neural-blue border border-neural-blue/50 rounded-md text-sm font-medium hover:bg-neural-blue/20 transition-all duration-150"
            >
              🔄 Re-planifier
            </button>
          </div>
        );

      case 'FAILED':
        return (
          <button
            onClick={handleStartPlanning}
            disabled={!project.description}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 rounded-md text-sm font-medium hover:bg-yellow-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔧 Réessayer la planification
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-bg-primary border-b border-neutral-700">
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Planification Intelligente
          </h3>
          <p className="text-sm text-text-tertiary">
            Laissez l'IA analyser et enrichir vos tâches existantes
          </p>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="flex items-center space-x-3">
        {getActionButton()}
      </div>
    </div>
  );
};

export default TaskListHeader;