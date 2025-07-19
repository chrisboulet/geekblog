import React, { useState, useEffect } from 'react';
import { Project } from '../../types/api';
import Modal from '../ui/Modal';
import { useUpdateProject } from '../../hooks/mutations/useUpdateProject';

interface ProjectEditModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const updateProjectMutation = useUpdateProject();

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // OPTIMIZATION: Only send changed fields (partial update)
    const updates: { name?: string; description?: string } = {};

    if (name.trim() !== project.name) {
      updates.name = name.trim();
    }

    if (description.trim() !== (project.description || '')) {
      updates.description = description.trim() || undefined;
    }

    // Only make API call if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateProjectMutation.mutate(
        { projectId: project.id, data: updates },
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
    setName(project.name);
    setDescription(project.description || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Project"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all"
                placeholder="Enter project name..."
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Description
              </label>
              <textarea
                id="projectDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue neural-focusable transition-all resize-none"
                placeholder="Optional project description..."
                rows={3}
              />
            </div>
          </div>

          {updateProjectMutation.isError && (
            <div className="mt-4 p-3 neural-error rounded-md">
              <p className="text-sm">Failed to update project. Please try again.</p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateProjectMutation.isPending}
            className="neural-button neural-interactive neural-clickable neural-focusable disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProjectMutation.isPending || !name.trim()}
            className="neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
          >
            {updateProjectMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ProjectEditModal;
