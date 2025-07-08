/**
 * Template service for API integration
 * Handles all template-related API calls with proper typing
 */

import apiClient from '../lib/api';
import { Template, ProjectFromTemplate, TemplateStats } from '../types/templates';
import { Project } from '../types/types';

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
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.tone) searchParams.append('tone', params.tone);
    if (params?.active_only !== undefined) {
      searchParams.append('active_only', params.active_only.toString());
    }

    const queryString = searchParams.toString();
    const url = `/templates${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<Template[]>(url);
    return response.data;
  }

  /**
   * Fetch a specific template by ID
   */
  static async getTemplate(id: number): Promise<Template> {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  }

  /**
   * Fetch a template by slug
   */
  static async getTemplateBySlug(slug: string): Promise<Template> {
    const response = await apiClient.get<Template>(`/templates/slug/${slug}`);
    return response.data;
  }

  /**
   * Get all template categories
   */
  static async getTemplateCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/templates/categories');
    return response.data;
  }

  /**
   * Get template statistics
   */
  static async getTemplateStats(): Promise<TemplateStats> {
    const response = await apiClient.get<TemplateStats>('/templates/stats');
    return response.data;
  }

  /**
   * Create a project from a template
   */
  static async createProjectFromTemplate(
    request: ProjectFromTemplate
  ): Promise<Project> {
    const response = await apiClient.post<Project>('/templates/projects/from-template', request);
    return response.data;
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
    
    const response = await apiClient.post<Array<{ title: string; description: string }>>(
      '/templates/preview-tasks',
      requestBody
    );
    return response.data;
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