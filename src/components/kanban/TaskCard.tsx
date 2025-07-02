import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Task as KanbanTaskType } from '../../types/kanban';
import { MoreHorizontal, Brain, Search, Edit3 } from 'lucide-react'; // Icônes
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

interface TaskCardProps {
  task: KanbanTaskType;
  projectId: number | string; // Nécessaire pour invalider la query du projet
  // onClick?: () => void; // Pour ouvrir une modale de détails
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projectId }) => {
  const queryClient = useQueryClient();

  const runAgentMutation = useMutation({
    mutationFn: ({ agentType, context }: { agentType: api.AgentType; context?: string }) => {
      // task.id est une string dans KanbanTaskType, mais l'API attend un nombre potentiellement
      return api.runAgentOnTask(Number(task.id), agentType, context);
    },
    onSuccess: (updatedTaskData) => {
      // Mettre à jour la query du projet pour refléter les changements dans la tâche
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      console.log(`Agent ${updatedTaskData.status} sur tâche ${updatedTaskData.id} terminé, résultat:`, updatedTaskData.description);
      // Idéalement, afficher une notification
    },
    onError: (error, variables) => {
      console.error(`Erreur lors de l'exécution de l'agent ${variables.agentType} sur la tâche ${task.id}:`, error);
      // Afficher une notification d'erreur
    },
  });

  const handleDelegateToAI = (agentType: api.AgentType) => {
    // Pour le chercheur, le contexte pourrait être vide ou des instructions spécifiques.
    // Pour le rédacteur, le contexte est généralement le résultat d'une recherche (description actuelle de la tâche).
    let contextForAgent: string | undefined = undefined;
    if (agentType === 'writer') {
      contextForAgent = task.description; // Utiliser la description actuelle comme contexte pour le rédacteur
    }
    // On pourrait aussi ouvrir une modale pour demander un contexte spécifique à l'utilisateur ici.

    runAgentMutation.mutate({ agentType, context: contextForAgent });
  };

  return (
    <div
      className="bg-bg-primary p-3 rounded-lg shadow-md border border-neutral-700/50 hover:border-neural-blue focus-within:border-neural-blue focus-within:ring-1 focus-within:ring-neural-blue transition-colors duration-150 ease-in-out cursor-grab active:cursor-grabbing"
      // onClick={onClick} // Sera activé plus tard
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-text-primary text-base leading-tight pr-2 break-words">
          {task.title}
        </h3>
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <button
              className="p-1 rounded-full text-text-tertiary hover:text-neural-pink hover:bg-bg-secondary transition-colors"
              aria-label="Options de la tâche"
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              align="end"
              sideOffset={5}
              className="bg-bg-secondary border border-neutral-700 rounded-md shadow-xl p-1 z-50 min-w-[200px] text-sm text-text-primary animate-in slide-in-from-top-2"
            >
              <DropdownMenuPrimitive.Item
                className="flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-blue/30 outline-none cursor-pointer"
                onClick={() => console.log('Modifier la tâche (non implémenté)', task.id)}
              >
                <Edit3 size={14} className="mr-2 text-neural-blue" /> Modifier la tâche
              </DropdownMenuPrimitive.Item>
              <DropdownMenuPrimitive.Separator className="h-px bg-neutral-700 my-1" />
              <DropdownMenuPrimitive.Label className="px-2 py-1 text-xs text-text-tertiary">Déléguer à l'IA</DropdownMenuPrimitive.Label>
              <DropdownMenuPrimitive.Item
                className={`flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-blue/30 outline-none cursor-pointer ${runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'researcher' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleDelegateToAI('researcher')}
                disabled={runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'researcher'}
              >
                <Search size={14} className="mr-2 text-neural-purple" />
                {runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'researcher' ? 'Recherche IA...' : 'Chercheur IA'}
              </DropdownMenuPrimitive.Item>
              <DropdownMenuPrimitive.Item
                className={`flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-blue/30 outline-none cursor-pointer ${runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'writer' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleDelegateToAI('writer')}
                disabled={runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'writer'}
              >
                <Brain size={14} className="mr-2 text-neural-pink" />
                {runAgentMutation.isPending && runAgentMutation.variables?.agentType === 'writer' ? 'Rédaction IA...' : 'Rédacteur IA'}
              </DropdownMenuPrimitive.Item>
              {/* Ajouter d'autres actions ici, comme Supprimer */}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
      {task.description && (
        <p className="text-sm text-text-secondary mb-3 break-words whitespace-pre-wrap">
          {task.description}
        </p>
      )}
      {runAgentMutation.isPending && (
         <p className="text-xs text-neural-blue animate-pulse-fast">Agent IA en cours ({runAgentMutation.variables?.agentType})...</p>
      )}
      {runAgentMutation.error && (
         <p className="text-xs text-red-400">Erreur Agent IA: {runAgentMutation.error instanceof Error ? runAgentMutation.error.message : "Erreur inconnue"}</p>
      )}
      {/* <div className="text-xs text-text-tertiary">ID: {task.id}</div> */}
    </div>
  );
};

export default TaskCard;
