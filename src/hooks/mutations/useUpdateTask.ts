import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Task, TaskUpdate, Project } from '../../types/api';
import { useToastActions } from '../../components/ui/Toast';

interface UpdateTaskPayload {
  taskId: number;
  data: TaskUpdate;
  projectId?: number; // Optional, for cache invalidation
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const toast = useToastActions();

  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskPayload) =>
      api.updateTask(taskId, data),

    // CRITICAL: Optimistic update pattern
    onMutate: async ({ taskId, data, projectId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      if (projectId) {
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });
      }

      // Snapshot the previous values
      const previousProject = projectId ?
        queryClient.getQueryData<Project>(['project', projectId]) : null;

      // Optimistically update the task within the project
      if (previousProject && projectId) {
        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          tasks: previousProject.tasks.map(task =>
            task.id === taskId ? { ...task, ...data } : task
          )
        });
      }

      // Return context for rollback
      return { previousProject, taskId, projectId };
    },

    // Rollback on error
    onError: (err, { taskId, projectId }, context) => {
      if (context?.previousProject && projectId) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }

      toast.error('Failed to update task. Please try again.');
    },

    // Refetch to ensure consistency
    onSettled: (data, err, { taskId, projectId }) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },

    onSuccess: () => {
      toast.success('Task updated successfully!');
    }
  });
};
