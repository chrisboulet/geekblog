import { JobStatus } from '../types/job';
import { apiClient } from '../lib/api';

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
  const response = await apiClient.post(`projects/${projectId}/plan-async`, projectGoal);
  return response.data;
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
  const response = await apiClient.post(`projects/${projectId}/plan`, projectGoal);
  return response.data;
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
  const response = await apiClient.post(`tasks/${taskId}/run-agent`, {
    agent_type: agentType,
    context: context
  });
  return response.data;
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
  const response = await apiClient.post(`tasks/${taskId}/run-agent-async`, {
    agent_type: agentType,
    context: context
  });
  return response.data;
};
