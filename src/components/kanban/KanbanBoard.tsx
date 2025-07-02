import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Project, Task as ApiTask } from '../../types/api'; // Utiliser les types API
import { Column as KanbanColumnType, Task as KanbanTaskType } from '../../types/kanban'; // Types locaux pour le kanban
import TaskCard from './TaskCard';
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Statuts prédéfinis pour les colonnes du Kanban
const KANBAN_COLUMNS_STATUS_ORDER = ['À faire', 'En cours', 'Révision', 'Terminé'];

interface KanbanBoardProps {
  project: Project; // Accepter le projet complet
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ project }) => {
  const queryClient = useQueryClient();

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

  // Logique DND (sera implémentée dans une prochaine étape)
  // const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  // const handleDragEnd = (event) => { ... }

  if (!project) return <p>Aucun projet sélectionné.</p>;

  return (
    // <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <div className="flex space-x-4 p-4 overflow-x-auto h-full bg-bg-secondary rounded-lg shadow-lg">
      {/* <SortableContext items={kanbanColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}> */}
        {kanbanColumns.map((column) => (
          // <KanbanColumnComponent key={column.id} column={column}>  // Composant séparé pour la colonne si elle devient complexe
          <div key={column.id} className="bg-bg-primary w-80 min-w-[320px] rounded-lg p-4 shadow-md flex flex-col max-h-full">
            <h2 className="text-xl font-semibold mb-4 text-neural-pink border-b-2 border-neural-pink pb-2 capitalize">
              {column.title} ({column.tasks.length})
            </h2>
            {/* <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}> */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={project.id} />
                ))}
                {column.tasks.length === 0 && (
                  <p className="text-sm text-text-tertiary text-center py-4">Aucune tâche.</p>
                )}
              </div>
            {/* </SortableContext> */}
            <button
              className="mt-4 text-sm text-neural-blue hover:text-neural-pink transition-colors"
              // onClick={() => handleAddTask(column.id)} // Sera implémenté
            >
              + Ajouter une tâche
            </button>
          </div>
          // </KanbanColumnComponent>
        ))}
      {/* </SortableContext> */}
    </div>
    // </DndContext>
  );
};

export default KanbanBoard;
