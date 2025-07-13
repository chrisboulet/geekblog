import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import { createProject } from '../../lib/api';
import { ProjectCreate } from '../../types/api';
import { useToastActions } from '../ui/Toast';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToastActions();

  // Create project mutation (following existing pattern from ProjectListPage)
  const createProjectMutation = useMutation({
    mutationFn: (projectData: ProjectCreate) => createProject(projectData),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
      navigate(`/project/${newProject.id}`);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    },
    onError: () => {
      toast.error('Failed to create project. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createProjectMutation.mutate({
      name: name.trim(),
      description: description.trim() || 'My new GeekBlog project',
    });
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Project"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newProjectName"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="newProjectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all"
                placeholder="e.g., Tech Blog 2024"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="newProjectDescription"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Description (optional)
              </label>
              <textarea
                id="newProjectDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all resize-none"
                placeholder="Brief project description..."
                rows={3}
              />
            </div>
          </div>

          {createProjectMutation.isError && (
            <div className="mt-4 p-3 neural-error rounded-md">
              <p className="text-sm">Failed to create project. Please try again.</p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            onClick={handleCancel}
            disabled={createProjectMutation.isPending}
            className="neural-button neural-interactive neural-clickable neural-focusable disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProjectMutation.isPending || !name.trim()}
            className="neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
          >
            {createProjectMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              '✨ Create Project'
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ProjectCreateModal;
