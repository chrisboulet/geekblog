import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  defaultStatus: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId, 
  defaultStatus 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (taskData: api.TaskCreate) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setTitle('');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      status: defaultStatus,
      project_id: projectId,
      order: Date.now() // Simple ordering by timestamp
    });
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="neural-card bg-gradient-to-br from-bg-primary to-bg-secondary p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 neural-text-gradient">
          Nouvelle tâche - {defaultStatus}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neural-blue focus:shadow-neural-glow-blue"
              placeholder="Titre de la tâche"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neural-blue focus:shadow-neural-glow-blue resize-none"
              placeholder="Description de la tâche (optionnel)"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!title.trim() || createTaskMutation.isPending}
              className="neural-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {createTaskMutation.isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="neural-button bg-bg-secondary hover:bg-neural-pink/20 text-text-secondary hover:text-neural-pink border border-neural-pink/30"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;