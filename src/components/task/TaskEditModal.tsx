import React, { useState, useEffect } from 'react';
import { Task } from '../../types/api';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useUpdateTask } from '../../hooks/mutations/useUpdateTask';
import { useDeleteTask } from '../../hooks/mutations/useDeleteTask';

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ 
  task, 
  isOpen, 
  onClose 
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status || 'pending');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    // OPTIMIZATION: Only send changed fields (partial update)
    const updates: { title?: string; description?: string; status?: string } = {};
    
    if (title.trim() !== task.title) {
      updates.title = title.trim();
    }
    
    if (description.trim() !== (task.description || '')) {
      updates.description = description.trim() || undefined;
    }
    
    if (status !== task.status) {
      updates.status = status;
    }
    
    // Only make API call if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateTaskMutation.mutate(
        { 
          taskId: task.id, 
          data: updates,
          projectId: task.project_id 
        },
        {
          onSuccess: () => {
            onClose();
          }
        }
      );
    } else {
      onClose(); // No changes, just close
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'pending');
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteTaskMutation.mutate(
      { taskId: task.id, projectId: task.project_id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          onClose();
        }
      }
    );
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleCancel}
        title="Edit Task"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="taskTitle" 
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all"
                  placeholder="Enter task title..."
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label 
                  htmlFor="taskDescription" 
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Description
                </label>
                <textarea
                  id="taskDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all resize-none"
                  placeholder="Optional task description..."
                  rows={3}
                />
              </div>

              <div>
                <label 
                  htmlFor="taskStatus" 
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Status
                </label>
                <select
                  id="taskStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all"
                >
                  <option value="pending">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
            
            {updateTaskMutation.isError && (
              <div className="mt-4 p-3 neural-error rounded-md">
                <p className="text-sm">Failed to update task. Please try again.</p>
              </div>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <div className="flex justify-between w-full">
              <button
                type="button"
                onClick={handleDelete}
                disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
                className="neural-button border-red-500 text-red-400 hover:bg-red-500/10 neural-interactive neural-clickable neural-focusable disabled:opacity-50"
              >
                🗑️ Delete
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updateTaskMutation.isPending}
                  className="neural-button neural-interactive neural-clickable neural-focusable disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTaskMutation.isPending || !title.trim()}
                  className="neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
                >
                  {updateTaskMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteTaskMutation.isPending}
      />
    </>
  );
};

export default TaskEditModal;