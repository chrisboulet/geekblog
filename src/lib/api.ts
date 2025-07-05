import axios from 'axios';
import {
    Project,
    ProjectCreate,
    ProjectUpdate,
    Task,
    TaskCreate,
    TaskUpdate
} from '../types/api'; // Ces types devront être créés/ajustés pour correspondre aux schémas Pydantic
import { JobStatus } from '../types/job';

// Re-export types for easier usage
export type {
    Project,
    ProjectCreate,
    ProjectUpdate,
    Task,
    TaskCreate,
    TaskUpdate
} from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1', // L'URL de base de l'API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types API (simplifiés, à affiner en fonction des schémas Pydantic du backend)
// Il serait mieux de générer ces types à partir de la spécification OpenAPI du backend
// Ou de les définir précisément pour qu'ils correspondent aux schemas.py

// Fonctions pour les Projets
export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const getProject = async (projectId: number | string): Promise<Project> => {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data;
};

export const createProject = async (projectData: ProjectCreate): Promise<Project> => {
  const response = await apiClient.post('/projects', projectData);
  return response.data;
};

export const updateProject = async (projectId: number | string, projectData: ProjectUpdate): Promise<Project> => {
  const response = await apiClient.put(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId: number | string): Promise<Project> => {
  const response = await apiClient.delete(`/projects/${projectId}`);
  return response.data;
};

// Fonction pour la Planification IA de Projet
export const planProject = async (projectId: number | string, projectGoal?: string): Promise<Project> => {
  const payload = projectGoal ? { project_goal: projectGoal } : {};
  const response = await apiClient.post(`/projects/${projectId}/plan`, payload);
  return response.data;
};

// Fonctions pour les Tâches
export const getTasksByProject = async (projectId: number | string): Promise<Task[]> => {
  const response = await apiClient.get(`/tasks/project/${projectId}`);
  return response.data;
};

export const getTask = async (taskId: number | string): Promise<Task> => {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData: TaskCreate): Promise<Task> => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId: number | string, taskData: TaskUpdate): Promise<Task> => {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: number | string): Promise<Task> => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

// Fonction pour exécuter un agent IA sur une tâche
export type AgentType = "researcher" | "writer";

export const runAgentOnTask = async (
  taskId: number | string,
  agentType: AgentType,
  context?: string
): Promise<Task> => {
  const payload = { agent_type: agentType, context: context };
  const response = await apiClient.post(`/tasks/${taskId}/run-agent`, payload);
  return response.data;
};

// Fonction pour lancer le Crew de Finition
export const runFinishingCrew = async (projectId: number | string, rawContent: string): Promise<string> => {
  const payload = { raw_content: rawContent };
  const response = await apiClient.post(`/projects/${projectId}/assemble`, payload);
  // La réponse est directement le texte raffiné (string), pas un objet JSON Task ou Project
  return response.data;
};

// ============== ASYNC ENDPOINTS ==============
// These functions return JobStatus objects for polling-based async operations

// Async version of project planning
export const planProjectAsync = async (projectId: number | string, projectGoal?: string): Promise<JobStatus> => {
  const payload = projectGoal ? { project_goal: projectGoal } : {};
  const response = await apiClient.post(`/projects/${projectId}/plan-async`, payload);
  return response.data;
};

// Async version of project content assembly/finishing
export const assembleProjectAsync = async (projectId: number | string, rawContent: string): Promise<JobStatus> => {
  const payload = { raw_content: rawContent };
  const response = await apiClient.post(`/projects/${projectId}/assemble-async`, payload);
  return response.data;
};

// Async version of running AI agents on tasks
export const runAgentOnTaskAsync = async (
  taskId: number | string,
  agentType: AgentType,
  context?: string
): Promise<JobStatus> => {
  const payload = { agent_type: agentType, context: context };
  const response = await apiClient.post(`/tasks/${taskId}/run-agent-async`, payload);
  return response.data;
};

export default apiClient;
