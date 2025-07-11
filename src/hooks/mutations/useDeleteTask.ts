import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Task, Project } from '../../types/api';
import { useToastActions } from '../../components/ui/Toast';

interface DeleteTaskPayload {
  taskId: number;
  projectId: number;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const toast = useToastActions();

  return useMutation({
    mutationFn: ({ taskId }: DeleteTaskPayload) => api.deleteTask(taskId),

    // CRITICAL: Optimistic update pattern for deletion
    onMutate: async ({ taskId, projectId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous project state
      const previousProject = queryClient.getQueryData<Project>(['project', projectId]);

      // Optimistically remove the task from the project
      if (previousProject) {
        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          tasks: previousProject.tasks.filter(task => task.id !== taskId)
        });
      }

      // Return context for rollback
      return { previousProject, taskId, projectId };
    },

    // Rollback on error
    onError: (err, { taskId, projectId }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      
      toast.error('Failed to delete task. Please try again.');
    },

    // Refetch to ensure consistency
    onSettled: (data, err, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },

    onSuccess: () => {
      toast.success('Task deleted successfully.');
    }
  });
};