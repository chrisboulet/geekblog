/**
 * React hooks for template management with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TemplateService } from '../services/templateService';
import { Template, ProjectFromTemplate, TemplateStats } from '../types/templates';
import { Project } from '../types/types';

// Query keys for consistent caching
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: number) => [...templateKeys.details(), id] as const,
  bySlug: (slug: string) => [...templateKeys.details(), 'slug', slug] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
  stats: () => [...templateKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all templates with optional filters
 */
export function useTemplates(params?: {
  category?: string;
  difficulty?: string;
  tone?: string;
  active_only?: boolean;
}) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => TemplateService.getTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a specific template by ID
 */
export function useTemplate(id: number, enabled = true) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => TemplateService.getTemplate(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a template by slug
 */
export function useTemplateBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: templateKeys.bySlug(slug),
    queryFn: () => TemplateService.getTemplateBySlug(slug),
    enabled: enabled && Boolean(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch template categories
 */
export function useTemplateCategories() {
  return useQuery({
    queryKey: templateKeys.categories(),
    queryFn: () => TemplateService.getTemplateCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change rarely
  });
}

/**
 * Hook to fetch template statistics
 */
export function useTemplateStats() {
  return useQuery({
    queryKey: templateKeys.stats(),
    queryFn: () => TemplateService.getTemplateStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get the Guide Pratique template specifically
 */
export function useGuidePratiqueTemplate() {
  return useTemplateBySlug('guide-pratique-quebecois');
}

/**
 * Hook to create a project from a template
 */
export function useCreateProjectFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ProjectFromTemplate) => 
      TemplateService.createProjectFromTemplate(request),
    onSuccess: (newProject: Project) => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Optionally add the new project to the cache
      queryClient.setQueryData(['projects', 'detail', newProject.id], newProject);
    },
    onError: (error) => {
      console.error('Failed to create project from template:', error);
    },
  });
}

/**
 * Hook for template preview generation (server-side)
 */
export function useTemplatePreview(
  templateId: number | undefined,
  customization: {
    title: string;
    theme: string;
    localization_level: 'bas' | 'moyen' | 'élevé';
    audience: 'québécois' | 'francophone' | 'international';
  }
) {
  return useQuery({
    queryKey: ['template-preview', templateId, customization],
    queryFn: () => {
      if (!templateId) throw new Error('Template ID required');
      return TemplateService.generatePreviewTasks(templateId, customization);
    },
    enabled: Boolean(templateId && customization.title && customization.theme),
    staleTime: 2 * 60 * 1000, // 2 minutes - preview is dynamic
  });
}

/**
 * Hook to invalidate template caches
 */
export function useInvalidateTemplates() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: templateKeys.all }),
    invalidateList: (filters?: Record<string, any>) => 
      queryClient.invalidateQueries({ queryKey: templateKeys.list(filters) }),
    invalidateTemplate: (id: number) => 
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) }),
  };
}

/**
 * Hook for prefetching templates
 */
export function usePrefetchTemplates() {
  const queryClient = useQueryClient();

  return {
    prefetchTemplates: (params?: Parameters<typeof useTemplates>[0]) =>
      queryClient.prefetchQuery({
        queryKey: templateKeys.list(params),
        queryFn: () => TemplateService.getTemplates(params),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchTemplate: (id: number) =>
      queryClient.prefetchQuery({
        queryKey: templateKeys.detail(id),
        queryFn: () => TemplateService.getTemplate(id),
        staleTime: 10 * 60 * 1000,
      }),
  };
}