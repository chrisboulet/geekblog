import React, { useState } from 'react';
import { Project } from '../../types/api';
import DropdownMenu from '../ui/DropdownMenu';
import ConfirmDialog from '../ui/ConfirmDialog';
import ProjectEditModal from './ProjectEditModal';
import { useDeleteProject } from '../../hooks/mutations/useDeleteProject';

interface ProjectActionsMenuProps {
  project: Project;
}

const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({ project }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteProjectMutation = useDeleteProject();

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDuplicate = () => {
    // TODO: Implement project duplication
    console.log('Duplicate project:', project.id);
  };

  const handleArchive = () => {
    // TODO: Implement project archiving
    console.log('Archive project:', project.id);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteProjectMutation.mutate(project.id);
    setShowDeleteDialog(false);
  };

  const trigger = (
    <button
      className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-neural-purple/10"
      aria-label="Project actions"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="2" r="1.5"/>
        <circle cx="8" cy="8" r="1.5"/>
        <circle cx="8" cy="14" r="1.5"/>
      </svg>
    </button>
  );

  return (
    <>
      <DropdownMenu trigger={trigger} align="end">
        <DropdownMenu.Item onSelect={handleEdit}>
          <div className="flex items-center gap-2">
            <span>✏️</span>
            <span>Edit</span>
          </div>
        </DropdownMenu.Item>

        <DropdownMenu.Item onSelect={handleDuplicate}>
          <div className="flex items-center gap-2">
            <span>📋</span>
            <span>Duplicate</span>
          </div>
        </DropdownMenu.Item>

        <DropdownMenu.Item onSelect={handleArchive}>
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>Archive</span>
          </div>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item onSelect={handleDelete} destructive>
          <div className="flex items-center gap-2">
            <span>🗑️</span>
            <span>Delete</span>
          </div>
        </DropdownMenu.Item>
      </DropdownMenu>

      {/* Edit Modal */}
      <ProjectEditModal
        project={project}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will also delete all tasks within this project.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteProjectMutation.isPending}
      />
    </>
  );
};

export default ProjectActionsMenu;
