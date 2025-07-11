import React, { useMemo } from 'react';
import { Project, Task } from '../../types/api';

interface AssistantSuggestion {
  id: string;
  type: 'planning' | 'research' | 'writing' | 'organization' | 'completion';
  title: string;
  description: string;
  action?: () => void;
  priority: 'low' | 'medium' | 'high';
}

interface ContextualAssistantProps {
  project: Project;
  onSuggestionClick?: (suggestion: AssistantSuggestion) => void;
}

const ContextualAssistant: React.FC<ContextualAssistantProps> = ({ 
  project, 
  onSuggestionClick 
}) => {
  
  const suggestions = useMemo((): AssistantSuggestion[] => {
    const suggestions: AssistantSuggestion[] = [];
    
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'Terminé').length;
    const aiTasks = project.tasks.filter(task => task.created_by_ai || task.last_updated_by_ai_at).length;
    const inProgressTasks = project.tasks.filter(task => task.status === 'En cours').length;
    const emptyDescriptionTasks = project.tasks.filter(task => !task.description || task.description.trim() === '').length;
    
    // Suggestion de planification initiale
    if (totalTasks === 0 && project.planning_status === 'NOT_STARTED') {
      suggestions.push({
        id: 'initial-planning',
        type: 'planning',
        title: 'Démarrer avec la planification IA',
        description: 'Votre projet est vide. Laissez l\'IA créer une structure de tâches basée sur votre description.',
        priority: 'high'
      });
    }
    
    // Suggestion de re-planification
    if (totalTasks > 0 && project.planning_status === 'NOT_STARTED') {
      suggestions.push({
        id: 'enhance-planning',
        type: 'planning',
        title: 'Enrichir vos tâches avec l\'IA',
        description: `Vous avez ${totalTasks} tâche(s). L'IA peut les analyser et proposer des améliorations.`,
        priority: 'medium'
      });
    }
    
    // Suggestion de recherche pour tâches vides
    if (emptyDescriptionTasks > 0 && emptyDescriptionTasks <= 3) {
      suggestions.push({
        id: 'research-empty-tasks',
        type: 'research',
        title: 'Recherche automatique recommandée',
        description: `${emptyDescriptionTasks} tâche(s) n'ont pas de description. L'IA peut effectuer des recherches pour les enrichir.`,
        priority: 'medium'
      });
    }
    
    // Suggestion d'organisation
    if (totalTasks > 5 && project.tasks.filter(task => !task.order || task.order === 0).length > 2) {
      suggestions.push({
        id: 'organize-tasks',
        type: 'organization',
        title: 'Organiser les tâches',
        description: 'Plusieurs tâches n\'ont pas d\'ordre défini. Considérez les réorganiser pour un workflow plus clair.',
        priority: 'low'
      });
    }
    
    // Suggestion de rédaction pour tâches recherchées
    const researchedTasks = project.tasks.filter(task => 
      task.status === 'Révision' && task.description && task.description.length > 100
    );
    if (researchedTasks.length > 0 && researchedTasks.length <= 2) {
      suggestions.push({
        id: 'writing-researched-tasks',
        type: 'writing',
        title: 'Rédaction automatique disponible',
        description: `${researchedTasks.length} tâche(s) avec recherche terminée peuvent être rédigées par l'IA.`,
        priority: 'medium'
      });
    }
    
    // Suggestion de finalisation
    if (completedTasks > 0 && completedTasks === totalTasks && totalTasks > 1) {
      suggestions.push({
        id: 'project-completion',
        type: 'completion',
        title: 'Projet prêt pour finalisation',
        description: 'Toutes les tâches sont terminées ! Vous pouvez maintenant assembler le contenu final.',
        priority: 'high'
      });
    }
    
    // Suggestion de progression pour tâches en cours
    if (inProgressTasks > 0 && inProgressTasks <= 2) {
      suggestions.push({
        id: 'progress-tasks',
        type: 'research',
        title: 'Accélérer les tâches en cours',
        description: `${inProgressTasks} tâche(s) en cours peuvent bénéficier d'une assistance IA pour progresser plus rapidement.`,
        priority: 'low'
      });
    }
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [project]);

  const handleSuggestionClick = (suggestion: AssistantSuggestion) => {
    onSuggestionClick?.(suggestion);
    suggestion.action?.();
  };

  const getTypeIcon = (type: AssistantSuggestion['type']) => {
    switch (type) {
      case 'planning': return '🗺️';
      case 'research': return '🔍';
      case 'writing': return '✍️';
      case 'organization': return '📋';
      case 'completion': return '🎉';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: AssistantSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-400/5';
      case 'medium': return 'border-l-yellow-400 bg-yellow-400/5';
      case 'low': return 'border-l-blue-400 bg-blue-400/5';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b border-neutral-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-full bg-neural-blue/20 flex items-center justify-center">
          🤖
        </div>
        <h4 className="text-sm font-medium text-text-primary">
          Assistant Contextuel
        </h4>
        <span className="text-xs text-text-tertiary">
          {suggestions.length} suggestion(s)
        </span>
      </div>
      
      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-neutral-700/30 transition-colors ${getPriorityColor(suggestion.priority)}`}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getTypeIcon(suggestion.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium text-text-primary truncate">
                    {suggestion.title}
                  </h5>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    suggestion.priority === 'high' ? 'bg-red-400/20 text-red-400' :
                    suggestion.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-blue-400/20 text-blue-400'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {suggestion.description}
                </p>
              </div>
              <button className="flex-shrink-0 text-xs text-neural-blue hover:text-neural-blue/80 transition-colors">
                →
              </button>
            </div>
          </div>
        ))}
        
        {suggestions.length > 3 && (
          <div className="text-center">
            <button className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              +{suggestions.length - 3} autres suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualAssistant;