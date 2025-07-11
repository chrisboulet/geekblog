import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as api from '../../lib/api';
import { Project } from '../../types/api';
import { useToastActions } from '../../components/ui/Toast';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToastActions();

  return useMutation({
    mutationFn: (projectId: number) => api.deleteProject(projectId),

    // CRITICAL: Optimistic update pattern for deletion
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      // Snapshot the previous values
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
      const previousProject = queryClient.getQueryData<Project>(['project', projectId]);

      // Optimistically remove the project from the list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(['projects'], old => 
          old?.filter(p => p.id !== projectId) || []
        );
      }

      // Remove the individual project cache
      queryClient.removeQueries({ queryKey: ['project', projectId] });

      // Return context for rollback
      return { previousProjects, previousProject, projectId };
    },

    // Rollback on error
    onError: (err, projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      
      toast.error('Failed to delete project. Please try again.');
    },

    // Refetch to ensure consistency
    onSettled: (data, err, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Don't invalidate the specific project if it was successfully deleted
      if (err) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
    },

    onSuccess: (data, projectId) => {
      toast.success('Project deleted successfully.');
      
      // Navigate away from the project page if we're currently on it
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/project/${projectId}`)) {
        navigate('/projects');
      }
    }
  });
};