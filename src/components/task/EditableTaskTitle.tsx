import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types/api';
import { useUpdateTask } from '../../hooks/mutations/useUpdateTask';

interface EditableTaskTitleProps {
  task: Task;
  className?: string;
}

const EditableTaskTitle: React.FC<EditableTaskTitleProps> = ({ 
  task, 
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const updateTaskMutation = useUpdateTask();

  // ACCESSIBILITY: Focus management
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text for easy replacement
    }
  }, [isEditing]);

  // Reset title if task changes
  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    
    if (trimmedTitle && trimmedTitle !== task.title) {
      updateTaskMutation.mutate(
        {
          taskId: task.id,
          data: { title: trimmedTitle },
          projectId: task.project_id
        },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
          onError: () => {
            // Keep in edit mode on error, mutation hook will show toast
            // Reset to original title to avoid confusion
            setTitle(task.title);
          }
        }
      );
    } else if (!trimmedTitle) {
      // Empty title, reset to original
      setTitle(task.title);
      setIsEditing(false);
    } else {
      // No changes, just exit edit mode
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(task.title); // Reset to original
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    // Add small delay to allow click events to fire first
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          w-full bg-bg-secondary border border-neural-blue/50 rounded px-2 py-1
          text-text-primary placeholder-text-secondary 
          focus:outline-none focus:ring-2 focus:ring-neural-blue focus:border-neural-blue
          transition-all
          ${updateTaskMutation.isPending ? 'opacity-50 cursor-wait' : ''}
          ${className}
        `}
        disabled={updateTaskMutation.isPending}
        placeholder="Task title..."
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        cursor-pointer hover:bg-neural-purple/10 rounded px-2 py-1 -mx-2 -my-1
        transition-all duration-200 group
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label={`Edit task: ${task.title}. Double-click to edit.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      <span className="text-text-primary group-hover:text-neural-purple transition-colors">
        {task.title}
      </span>
      <span className="ml-2 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity text-xs">
        ✏️
      </span>
    </div>
  );
};

export default EditableTaskTitle;