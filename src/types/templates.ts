/**
 * TypeScript interfaces for template system
 * Based on backend API contract and blog analysis
 */

export interface TemplateStep {
  title: string;
  description: string;
}

export interface TemplateStructure {
  steps: TemplateStep[];
}

export interface Template {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'Facile' | 'Moyen' | 'Avancé';
  estimated_duration: string;
  target_audience: string;
  tone: string;
  localization_level: 'bas' | 'moyen' | 'élevé';
  is_boulet_style: boolean;
  template_structure: TemplateStructure;
  sample_expressions: Record<string, Record<string, string>>;
  additional_metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TemplateCustomization {
  title: string;
  theme: string;
  localization_level: 'bas' | 'moyen' | 'élevé';
  audience: 'québécois' | 'francophone' | 'international';
  additional_instructions?: string;
}

export interface ProjectFromTemplate {
  template_id: number;
  customization: TemplateCustomization;
}

export interface LocalizationLevel {
  value: 'bas' | 'moyen' | 'élevé';
  label: string;
  description: string;
  context: string;
  sample_expression: string;
}

export const LOCALIZATION_LEVELS: LocalizationLevel[] = [
  {
    value: 'bas',
    label: 'International',
    description: 'Français standard accessible à tous',
    context: 'Accessible à tous les francophones',
    sample_expression: 'Voici comment procéder...'
  },
  {
    value: 'moyen',
    label: 'Québécois Standard',
    description: 'Français québécois naturel',
    context: 'Naturel pour le Québec, compréhensible ailleurs',
    sample_expression: 'OK, mettons que vous voulez...'
  },
  {
    value: 'élevé',
    label: 'Authentique Québécois',
    description: 'Style Boulet avec références locales',
    context: 'Style Boulet authentique, références locales',
    sample_expression: 'Première affaire, vous partez de...'
  }
];

export interface TemplateCategory {
  value: string;
  label: string;
  description: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { value: 'Guide', label: 'Guide', description: 'Tutoriels et guides pratiques' },
  { value: 'Opinion', label: 'Opinion', description: 'Articles d\'opinion et débats' },
  { value: 'Analyse', label: 'Analyse', description: 'Analyses et comparaisons' },
  { value: 'Sécurité', label: 'Sécurité', description: 'Alertes et conseils sécurité' },
  { value: 'Série', label: 'Série', description: 'Contenu en série approfondie' },
  { value: 'Actualité', label: 'Actualité', description: 'Réactions à l\'actualité tech' }
];

export interface TemplateStats {
  total_templates: number;
  categories: string[];
  difficulty_distribution: Record<string, number>;
  boulet_style_templates: number;
}