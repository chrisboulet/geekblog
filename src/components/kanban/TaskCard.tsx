import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Task as KanbanTaskType } from '../../types/kanban';
import { MoreHorizontal, Brain, Search, Edit3, Zap, GripVertical } from 'lucide-react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import JobProgressBar from '../ui/JobProgressBar';
import JobStatusBadge from '../ui/JobStatusBadge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: KanbanTaskType;
  projectId: number | string;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projectId, isDragging = false }) => {
  const queryClient = useQueryClient();
  const [useAsync, setUseAsync] = useState(true);

  // useSortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: String(task.id),
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Existing sync mutation (preserved for backward compatibility)
  const runAgentMutation = useMutation({
    mutationFn: ({ agentType, context }: { agentType: api.AgentType; context?: string }) => {
      // Types harmonisés - plus besoin de conversion
      return api.runAgentOnTask(task.id, agentType, context);
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

  // New async operation hook
  const asyncAgentOperation = useAsyncOperation(
    ({ agentType, context }: { agentType: api.AgentType; context?: string }) => 
      api.runAgentOnTaskAsync(task.id, agentType, context),
    {
      invalidateQueries: [['project', projectId]],
      onSuccess: (result) => {
        console.log(`Async agent completed for task ${task.id}:`, result);
        // Could show success notification here
      },
      onError: (error) => {
        console.error(`Async agent failed for task ${task.id}:`, error);
        // Could show error notification here
      }
    }
  );

  const handleDelegateToAI = (agentType: api.AgentType, forceSync = false) => {
    // Pour le chercheur, le contexte pourrait être vide ou des instructions spécifiques.
    // Pour le rédacteur, le contexte est généralement le résultat d'une recherche (description actuelle de la tâche).
    let contextForAgent: string | undefined = undefined;
    if (agentType === 'writer') {
      contextForAgent = task.description; // Utiliser la description actuelle comme contexte pour le rédacteur
    }
    // On pourrait aussi ouvrir une modale pour demander un contexte spécifique à l'utilisateur ici.

    if (useAsync && !forceSync) {
      asyncAgentOperation.execute({ agentType, context: contextForAgent });
    } else {
      runAgentMutation.mutate({ agentType, context: contextForAgent });
    }
  };

  // Determine which operation is currently active
  const isExecuting = useAsync 
    ? asyncAgentOperation.isExecuting 
    : runAgentMutation.isPending;
  
  const currentError = useAsync 
    ? asyncAgentOperation.error 
    : (runAgentMutation.error instanceof Error ? runAgentMutation.error.message : null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-bg-primary p-3 rounded-lg shadow-md border border-neutral-700/50 hover:border-neural-blue focus-within:border-neural-blue focus-within:ring-1 focus-within:ring-neural-blue transition-all duration-150 ease-in-out ${
        isSortableDragging || isDragging 
          ? 'opacity-50 shadow-2xl scale-105 rotate-3 z-50' 
          : 'cursor-grab active:cursor-grabbing hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div 
            {...attributes} 
            {...listeners}
            className="text-text-tertiary hover:text-neural-blue transition-colors p-1 cursor-grab active:cursor-grabbing flex-shrink-0"
            aria-label="Glisser pour déplacer la tâche"
          >
            <GripVertical size={16} />
          </div>
          <h3 className="font-semibold text-text-primary text-base leading-tight break-words flex-1">
            {task.title}
          </h3>
        </div>
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
              <DropdownMenuPrimitive.Label className="px-2 py-1 text-xs text-text-tertiary">
                Mode: {useAsync ? 'Asynchrone' : 'Synchrone'}
              </DropdownMenuPrimitive.Label>
              
              {/* Mode toggle */}
              <DropdownMenuPrimitive.Item
                className="flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-purple/30 outline-none cursor-pointer"
                onClick={() => setUseAsync(!useAsync)}
              >
                <Zap size={14} className={`mr-2 ${useAsync ? 'text-neural-blue' : 'text-neural-purple'}`} />
                Basculer vers {useAsync ? 'synchrone' : 'asynchrone'}
              </DropdownMenuPrimitive.Item>
              
              <DropdownMenuPrimitive.Separator className="h-px bg-neutral-700 my-1" />
              <DropdownMenuPrimitive.Label className="px-2 py-1 text-xs text-text-tertiary">Déléguer à l'IA</DropdownMenuPrimitive.Label>
              
              <DropdownMenuPrimitive.Item
                className={`flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-blue/30 outline-none cursor-pointer ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleDelegateToAI('researcher')}
                disabled={isExecuting}
              >
                <Search size={14} className="mr-2 text-neural-purple" />
                {isExecuting ? 
                  (useAsync && asyncAgentOperation.step ? `${asyncAgentOperation.step}...` : 'Recherche IA...') : 
                  'Chercheur IA'
                }
                {useAsync && (
                  <span className="ml-auto text-xs text-neural-blue">Async</span>
                )}
              </DropdownMenuPrimitive.Item>
              
              <DropdownMenuPrimitive.Item
                className={`flex items-center px-2 py-1.5 rounded-sm hover:bg-neural-blue/30 outline-none cursor-pointer ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleDelegateToAI('writer')}
                disabled={isExecuting}
              >
                <Brain size={14} className="mr-2 text-neural-pink" />
                {isExecuting ? 
                  (useAsync && asyncAgentOperation.step ? `${asyncAgentOperation.step}...` : 'Rédaction IA...') : 
                  'Rédacteur IA'
                }
                {useAsync && (
                  <span className="ml-auto text-xs text-neural-blue">Async</span>
                )}
              </DropdownMenuPrimitive.Item>
              
              {/* Emergency sync fallback when async is active */}
              {useAsync && asyncAgentOperation.jobId && asyncAgentOperation.isPolling && (
                <>
                  <DropdownMenuPrimitive.Separator className="h-px bg-neutral-700 my-1" />
                  <DropdownMenuPrimitive.Item
                    className="flex items-center px-2 py-1.5 rounded-sm hover:bg-red-500/30 outline-none cursor-pointer text-red-400"
                    onClick={() => asyncAgentOperation.cancel()}
                  >
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM8 13a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                    </svg>
                    Annuler l'opération
                  </DropdownMenuPrimitive.Item>
                </>
              )}
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

      {/* Async operation progress */}
      {useAsync && asyncAgentOperation.status && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <JobStatusBadge 
              status={asyncAgentOperation.status} 
              size="sm" 
              showProgress={true}
            />
            {asyncAgentOperation.isExecuting && (
              <LoadingSpinner size="sm" color="neural-blue" />
            )}
          </div>
          <JobProgressBar 
            status={asyncAgentOperation.status}
            size="sm"
            showStep={true}
            showTimeRemaining={true}
          />
        </div>
      )}

      {/* Legacy sync operation status */}
      {!useAsync && runAgentMutation.isPending && (
         <p className="text-xs text-neural-blue animate-pulse-fast">Agent IA en cours ({runAgentMutation.variables?.agentType})...</p>
      )}
      
      {/* Error display for both sync and async */}
      {currentError && (
         <p className="text-xs text-red-400 mb-2">Erreur Agent IA: {currentError}</p>
      )}
      
      {/* <div className="text-xs text-text-tertiary">ID: {task.id}</div> */}
    </div>
  );
};

export default TaskCard;
