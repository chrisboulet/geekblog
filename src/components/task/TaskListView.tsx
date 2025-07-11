import React, { useState, useMemo } from 'react';
import { Project, Task as ApiTask } from '../../types/api';
import EditableTaskTitle from './EditableTaskTitle';
import TaskEditModal from './TaskEditModal';
import TaskCreateButton from './TaskCreateButton';
import { useToastActions } from '../ui/Toast';

interface TaskListViewProps {
  project: Project;
}

const TaskListView: React.FC<TaskListViewProps> = ({ project }) => {
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'title' | 'status' | 'order'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const toast = useToastActions();

  // Get unique statuses for filter dropdown
  const availableStatuses = useMemo(() => {
    const statuses = new Set(project.tasks.map(task => task.status || 'undefined'));
    return Array.from(statuses).sort();
  }, [project.tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = project.tasks;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => (task.status || 'undefined') === statusFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status || 'undefined';
          bValue = b.status || 'undefined';
          break;
        case 'order':
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated':
        default:
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [project.tasks, statusFilter, sortBy, sortOrder]);

  const handleTaskEdit = (task: ApiTask) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedTask(null);
    setIsEditModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'text-green-400 bg-green-400/10';
      case 'En cours':
        return 'text-neural-blue bg-neural-blue/10';
      case 'Révision':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'À faire':
      default:
        return 'text-text-tertiary bg-text-tertiary/10';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary rounded-lg shadow-lg">
      {/* Header with controls */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <h2 className="text-xl font-semibold text-neural-blue mb-2">
              Gestion des Tâches ({filteredAndSortedTasks.length}/{project.tasks.length})
            </h2>
            <p className="text-sm text-text-tertiary">
              Visualisez, modifiez et organisez toutes les tâches de votre projet
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-bg-primary border border-neutral-600 rounded-md text-text-primary text-sm focus:border-neural-blue focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            {/* Sort controls */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-bg-primary border border-neutral-600 rounded-md text-text-primary text-sm focus:border-neural-blue focus:outline-none"
            >
              <option value="updated">Modifié</option>
              <option value="created">Créé</option>
              <option value="title">Titre</option>
              <option value="status">Statut</option>
              <option value="order">Ordre</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-bg-primary border border-neutral-600 rounded-md text-text-primary text-sm hover:border-neural-blue transition-colors"
              title={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            
            {/* Create task button */}
            <TaskCreateButton projectId={project.id} />
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-4">
              {statusFilter === 'all' 
                ? 'Aucune tâche dans ce projet'
                : `Aucune tâche avec le statut "${statusFilter}"`
              }
            </p>
            {project.tasks.length === 0 && (
              <p className="text-text-tertiary text-sm">
                Commencez par créer votre première tâche avec le bouton ci-dessus
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-bg-primary border border-neutral-700/50 rounded-lg p-4 hover:border-neural-blue/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Editable title */}
                    <div className="mb-2">
                      <EditableTaskTitle 
                        task={task}
                        className="text-lg font-medium text-text-primary"
                      />
                    </div>
                    
                    {/* Task metadata */}
                    <div className="flex flex-wrap gap-3 text-sm text-text-tertiary mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'undefined')}`}>
                        {task.status || 'Undefined'}
                      </span>
                      
                      {task.order !== undefined && task.order > 0 && (
                        <span className="text-neural-pink">
                          Ordre: {task.order}
                        </span>
                      )}
                      
                      <span>
                        Créé: {formatDate(task.created_at)}
                      </span>
                      
                      <span>
                        Modifié: {formatDate(task.updated_at)}
                      </span>
                    </div>
                    
                    {/* Task description preview */}
                    {task.description && (
                      <div className="text-text-secondary text-sm line-clamp-2">
                        {task.description.length > 150 
                          ? `${task.description.substring(0, 150)}...`
                          : task.description
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleTaskEdit(task)}
                      className="px-3 py-2 bg-neural-blue/20 text-neural-blue border border-neural-blue rounded-md text-sm font-medium hover:bg-neural-blue/30 transition-all duration-150 opacity-60 group-hover:opacity-100"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
        />
      )}
    </div>
  );
};

export default TaskListView;