import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Project, Task as ApiTask } from '../../types/api';
import { Column as KanbanColumnType, Task as KanbanTaskType } from '../../types/kanban';
import TaskCard from './TaskCard';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

// Statuts prédéfinis pour les colonnes du Kanban
const KANBAN_COLUMNS_STATUS_ORDER = ['À faire', 'En cours', 'Révision', 'Terminé'];

// Composant pour zone de drop vide
const EmptyColumnDropZone: React.FC<{ columnId: string; isActive: boolean }> = ({ 
  columnId, 
  isActive 
}) => {
  const { setNodeRef } = useDroppable({
    id: columnId,
    data: {
      type: 'Column',
      columnId,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`text-sm text-text-tertiary text-center py-8 rounded-lg border-2 border-dashed transition-all duration-200 ${
        isActive ? 'border-neural-blue bg-neural-blue bg-opacity-10' : 'border-text-tertiary border-opacity-30'
      }`}
    >
      {isActive ? 'Déposez ici' : 'Aucune tâche'}
    </div>
  );
};

interface KanbanBoardProps {
  project: Project; // Accepter le projet complet
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ project }) => {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Transformation des tâches du projet en colonnes Kanban (optimisé avec useMemo)
  const kanbanColumns = useMemo<KanbanColumnType[]>(() => {
    if (!project?.tasks) return [];

    const columnsMap: Record<string, KanbanColumnType> = KANBAN_COLUMNS_STATUS_ORDER.reduce((acc, status) => {
      acc[status] = { id: status, title: status, tasks: [] };
      return acc;
    }, {} as Record<string, KanbanColumnType>);

    project.tasks.forEach(task => {
      const taskStatus = task.status || 'À faire'; // Default status si non défini
      if (columnsMap[taskStatus]) {
        // Conversion ApiTask vers KanbanTaskType (types maintenant harmonisés)
        columnsMap[taskStatus].tasks.push({
          id: task.id, // Types harmonisés - plus besoin de conversion
          title: task.title,
          description: task.description || undefined,
          status: taskStatus,
          order: task.order,
        });
      } else {
        // Gérer les tâches avec des statuts inconnus, peut-être les mettre dans une colonne "Autre"
        console.warn(`Tâche "${task.title}" avec statut inconnu: ${taskStatus}`);
      }
    });

    // Trier les tâches dans chaque colonne par leur `order`
    Object.values(columnsMap).forEach(column => {
      column.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return Object.values(columnsMap);
  }, [project]);

  // Mutation pour mettre à jour une tâche (sera utilisée par dnd-kit plus tard)
  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: api.TaskUpdate & { id: number }) =>
      api.updateTask(updatedTask.id, updatedTask),
    onSuccess: (updatedTaskData) => {
      // Invalider la query du projet pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      // Optionnel: mise à jour optimiste de l'UI ici
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
      // Gérer l'erreur, par exemple afficher une notification
    }
  });

  // Configuration des capteurs DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Empêche les drags accidentels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler pour le début du drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Handler pour la fin du drag
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Trouver la tâche active et la colonne/position de destination
    const activeTask = project.tasks?.find(task => String(task.id) === activeId);
    if (!activeTask) return;

    // Déterminer si on drop sur une colonne ou sur une tâche
    let newStatus: string = activeTask.status || 'À faire';
    let newOrder: number = activeTask.order || 0;

    // Si on drop sur une colonne (overId correspond à un status)
    if (KANBAN_COLUMNS_STATUS_ORDER.includes(overId)) {
      newStatus = overId;
      // Calculer le nouvel ordre (à la fin de la colonne)
      const tasksInColumn = project.tasks?.filter(task => task.status === newStatus) || [];
      newOrder = Math.max(...tasksInColumn.map(task => task.order || 0), 0) + 1;
    } else {
      // Si on drop sur une tâche, récupérer sa position
      const overTask = project.tasks?.find(task => String(task.id) === overId);
      if (overTask) {
        newStatus = overTask.status || 'À faire';
        newOrder = overTask.order || 0;
        
        // Réorganiser les autres tâches dans la même colonne
        const tasksInColumn = project.tasks?.filter(
          task => task.status === newStatus && task.id !== activeTask.id
        ) || [];
        
        tasksInColumn.forEach(task => {
          if ((task.order || 0) >= newOrder) {
            updateTaskMutation.mutate({
              id: task.id,
              order: (task.order || 0) + 1
            });
          }
        });
      }
    }

    // Mettre à jour la tâche active
    if (newStatus !== activeTask.status || newOrder !== activeTask.order) {
      updateTaskMutation.mutate({
        id: activeTask.id,
        status: newStatus,
        order: newOrder
      });
    }
  }, [project.tasks, updateTaskMutation]);

  // Handler pour le survol pendant le drag
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Ici on peut ajouter des animations ou feedback visuel
  }, []);

  if (!project) return <p>Aucun projet sélectionné.</p>;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex space-x-4 p-4 overflow-x-auto h-full bg-bg-secondary rounded-lg shadow-lg">
        {kanbanColumns.map((column) => (
          <div 
            key={column.id} 
            className={`bg-bg-primary w-80 min-w-[320px] rounded-lg p-4 shadow-md flex flex-col max-h-full transition-all duration-200 ${
              activeId && KANBAN_COLUMNS_STATUS_ORDER.includes(String(activeId)) ? 'ring-2 ring-neural-blue' : ''
            }`}
            data-column-id={column.id}
          >
            <h2 className="text-xl font-semibold mb-4 text-neural-pink border-b-2 border-neural-pink pb-2 capitalize">
              {column.title} ({column.tasks.length})
            </h2>
            <SortableContext items={column.tasks.map(task => String(task.id))} strategy={verticalListSortingStrategy}>
              <div className={`flex-grow overflow-y-auto space-y-3 pr-1 min-h-[200px] rounded-lg transition-all duration-200 ${
                activeId ? 'bg-bg-secondary bg-opacity-50' : ''
              }`}>
                {column.tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    projectId={project.id}
                    isDragging={String(task.id) === activeId}
                  />
                ))}
                {column.tasks.length === 0 && (
                  <EmptyColumnDropZone 
                    columnId={column.id} 
                    isActive={!!activeId} 
                  />
                )}
              </div>
            </SortableContext>
            <button
              className="mt-4 text-sm text-neural-blue hover:text-neural-pink transition-colors"
              onClick={() => {
                // TODO: Implémenter l'ajout de tâche
                console.log('Ajouter tâche à', column.id);
              }}
            >
              + Ajouter une tâche
            </button>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
