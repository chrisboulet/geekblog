import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { Project, ProjectUpdate } from '../../types/api';
import { useToastActions } from '../../components/ui/Toast';

interface UpdateProjectPayload {
  projectId: number;
  data: ProjectUpdate;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const toast = useToastActions();

  return useMutation({
    mutationFn: ({ projectId, data }: UpdateProjectPayload) =>
      api.updateProject(projectId, data),

    // CRITICAL: Optimistic update pattern
    onMutate: async ({ projectId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      // Snapshot the previous values
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
      const previousProject = queryClient.getQueryData<Project>(['project', projectId]);

      // Optimistically update the projects list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(['projects'], old =>
          old?.map(p => p.id === projectId ? { ...p, ...data } : p) || []
        );
      }

      // Optimistically update the individual project
      if (previousProject) {
        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          ...data
        });
      }

      // Return a context object with the snapshotted values
      return { previousProjects, previousProject, projectId };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, { projectId }, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }

      // Show error notification
      toast.error('Failed to update project. Please try again.');
    },

    // Always refetch after error or success to ensure server state
    onSettled: (data, err, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },

    onSuccess: () => {
      toast.success('Project updated successfully!');
    }
  });
};
