import { JobStatus } from '../types/job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Service pour les opérations IA
 */

/**
 * Lance la planification IA asynchrone d'un projet
 * @param projectId ID du projet à planifier
 * @param projectGoal Objectif du projet (optionnel, utilisera la description si omis)
 * @returns JobStatus pour suivre la progression
 */
export const planProjectAsync = async (
  projectId: number, 
  projectGoal?: string
): Promise<JobStatus> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/plan-async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectGoal),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Lance la planification IA synchrone d'un projet (version originale)
 * @param projectId ID du projet à planifier  
 * @param projectGoal Objectif du projet (optionnel)
 * @returns Projet mis à jour
 */
export const planProjectSync = async (
  projectId: number,
  projectGoal?: string
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectGoal),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Exécute un agent IA sur une tâche
 * @param taskId ID de la tâche
 * @param agentType Type d'agent ('researcher' ou 'writer')
 * @param context Contexte optionnel
 * @returns Tâche mise à jour
 */
export const runAgentOnTask = async (
  taskId: number,
  agentType: 'researcher' | 'writer',
  context?: string
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/run-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_type: agentType,
      context: context
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Lance un agent IA asynchrone sur une tâche
 * @param taskId ID de la tâche
 * @param agentType Type d'agent ('researcher' ou 'writer')
 * @param context Contexte optionnel
 * @returns JobStatus pour suivre la progression
 */
export const runAgentOnTaskAsync = async (
  taskId: number,
  agentType: 'researcher' | 'writer',
  context?: string
): Promise<JobStatus> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/run-agent-async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_type: agentType,
      context: context
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};