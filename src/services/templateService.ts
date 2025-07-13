/**
 * Template service for API integration
 * Handles all template-related API calls with proper typing and retry logic
 */

import { createApiService, createCustomApiService, CACHE_CONFIGS } from '../lib/apiServiceFactory';
import { BlogTemplateSchema } from '../types/generated/schemas';
import { BlogTemplate } from '../types/generated/models';
import { Template, ProjectFromTemplate, TemplateStats } from '../types/templates';
import { Project } from '../types/types';
import { z } from 'zod';

// Define validation schemas for template service responses
const TemplateArraySchema = z.array(BlogTemplateSchema);
const TemplateCategoriesSchema = z.array(z.string());
const TemplateStatsSchema = z.object({
  total_templates: z.number(),
  categories: z.array(z.string()),
  difficulty_distribution: z.record(z.string(), z.number()),
  boulet_style_templates: z.number(),
});

const PreviewTasksSchema = z.array(z.object({
  title: z.string(),
  description: z.string(),
}));

/**
 * Converts BlogTemplate from generated types to Template interface
 * This bridges the gap between generated backend types and frontend types
 */
function blogTemplateToTemplate(blogTemplate: BlogTemplate): Template {
  return {
    id: blogTemplate.id,
    name: blogTemplate.name,
    slug: blogTemplate.slug,
    description: blogTemplate.description,
    icon: blogTemplate.icon,
    category: blogTemplate.category,
    difficulty: (blogTemplate.difficulty as 'Facile' | 'Moyen' | 'Avancé') || 'Moyen',
    estimated_duration: blogTemplate.estimated_duration,
    target_audience: blogTemplate.target_audience,
    tone: blogTemplate.tone,
    localization_level: (blogTemplate.localization_level as 'bas' | 'moyen' | 'élevé') || 'moyen',
    is_boulet_style: blogTemplate.is_boulet_style || false,
    template_structure: blogTemplate.template_structure as any, // Convert Record<string, unknown> to TemplateStructure
    sample_expressions: blogTemplate.sample_expressions as any || {},
    additional_metadata: blogTemplate.additional_metadata || undefined,
    is_active: blogTemplate.is_active || true,
    created_at: blogTemplate.created_at || new Date().toISOString(),
    updated_at: blogTemplate.updated_at || undefined,
  };
}

// Create API service instances
const templateApiService = createApiService({
  endpoint: 'templates',
  validation: BlogTemplateSchema,
  cache: CACHE_CONFIGS.static, // Templates are relatively static
});

const templateCustomService = createCustomApiService({
  endpoint: 'templates',
  cache: CACHE_CONFIGS.static,
});

export class TemplateService {
  /**
   * Fetch all templates with optional filters
   */
  static async getTemplates(params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    tone?: string;
    active_only?: boolean;
  }): Promise<Template[]> {
    const blogTemplates = await templateApiService.list(params);
    return blogTemplates.map(blogTemplateToTemplate);
  }

  /**
   * Fetch a specific template by ID
   */
  static async getTemplate(id: number): Promise<Template> {
    const blogTemplate = await templateApiService.get(id);
    return blogTemplateToTemplate(blogTemplate);
  }

  /**
   * Fetch a template by slug
   */
  static async getTemplateBySlug(slug: string): Promise<Template> {
    const blogTemplate = await templateCustomService.makeRequest(
      () => templateCustomService.client.get(`templates/slug/${slug}`),
      BlogTemplateSchema
    );
    return blogTemplateToTemplate(blogTemplate);
  }

  /**
   * Get all template categories
   */
  static async getTemplateCategories(): Promise<string[]> {
    return templateCustomService.makeRequest(
      () => templateCustomService.client.get('templates/categories'),
      TemplateCategoriesSchema
    );
  }

  /**
   * Get template statistics
   */
  static async getTemplateStats(): Promise<TemplateStats> {
    return templateCustomService.makeRequest(
      () => templateCustomService.client.get('templates/stats'),
      TemplateStatsSchema
    );
  }

  /**
   * Create a project from a template
   */
  static async createProjectFromTemplate(
    request: ProjectFromTemplate
  ): Promise<Project> {
    return templateCustomService.makeRequest(
      () => templateCustomService.client.post('templates/projects/from-template', request)
    );
  }

  /**
   * Get the Guide Pratique template specifically
   */
  static async getGuidePratiqueTemplate(): Promise<Template> {
    return this.getTemplateBySlug('guide-pratique-quebecois');
  }

  /**
   * Generate preview tasks for a template customization using backend API
   * Replaced client-side logic with server-side generation for consistency
   */
  static async generatePreviewTasks(
    templateId: number,
    customization: { title: string; theme: string; localization_level: 'bas' | 'moyen' | 'élevé'; audience: 'québécois' | 'francophone' | 'international' }
  ): Promise<Array<{ title: string; description: string }>> {
    const requestBody: ProjectFromTemplate = {
      template_id: templateId,
      customization: {
        title: customization.title,
        theme: customization.theme,
        localization_level: customization.localization_level,
        audience: customization.audience
      }
    };

    return templateCustomService.makeRequest(
      () => templateCustomService.client.post('templates/preview-tasks', requestBody),
      PreviewTasksSchema
    );
  }

  /**
   * Validate template customization
   */
  static validateCustomization(customization: {
    title: string;
    theme: string;
    localization_level: 'bas' | 'moyen' | 'élevé';
    audience: 'québécois' | 'francophone' | 'international';
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!customization.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (customization.title && customization.title.length > 100) {
      errors.push('Le titre ne peut pas dépasser 100 caractères');
    }

    if (!customization.theme?.trim()) {
      errors.push('Le thème est requis');
    }

    if (!['bas', 'moyen', 'élevé'].includes(customization.localization_level)) {
      errors.push('Niveau de localisation invalide');
    }

    if (!['québécois', 'francophone', 'international'].includes(customization.audience)) {
      errors.push('Audience invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default TemplateService;
