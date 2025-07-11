import React, { useState } from 'react';
import AddTaskModal from '../kanban/AddTaskModal';

interface TaskCreateButtonProps {
  projectId: number;
  defaultStatus?: string;
}

const TaskCreateButton: React.FC<TaskCreateButtonProps> = ({ 
  projectId, 
  defaultStatus = 'pending' 
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="neural-button neural-interactive neural-clickable neural-focusable"
      >
        <span className="flex items-center gap-2">
          <span>➕</span>
          <span>Add Task</span>
        </span>
      </button>

      <AddTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        defaultStatus={defaultStatus}
      />
    </>
  );
};

export default TaskCreateButton;