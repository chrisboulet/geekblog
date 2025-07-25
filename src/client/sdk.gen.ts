// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from './client';
import type { HealthCheckHealthGetData, HealthCheckHealthGetResponses, HealthCheckApiV1HealthGetData, HealthCheckApiV1HealthGetResponses, DetailedHealthCheckApiV1HealthDetailedGetData, DetailedHealthCheckApiV1HealthDetailedGetResponses, LivenessProbeApiV1HealthLiveGetData, LivenessProbeApiV1HealthLiveGetResponses, ReadinessProbeApiV1HealthReadyGetData, ReadinessProbeApiV1HealthReadyGetResponses, ReadProjectsEndpointApiV1ProjectsGetData, ReadProjectsEndpointApiV1ProjectsGetResponses, ReadProjectsEndpointApiV1ProjectsGetErrors, CreateProjectEndpointApiV1ProjectsPostData, CreateProjectEndpointApiV1ProjectsPostResponses, CreateProjectEndpointApiV1ProjectsPostErrors, DeleteProjectEndpointApiV1ProjectsProjectIdDeleteData, DeleteProjectEndpointApiV1ProjectsProjectIdDeleteResponses, DeleteProjectEndpointApiV1ProjectsProjectIdDeleteErrors, ReadProjectEndpointApiV1ProjectsProjectIdGetData, ReadProjectEndpointApiV1ProjectsProjectIdGetResponses, ReadProjectEndpointApiV1ProjectsProjectIdGetErrors, UpdateProjectEndpointApiV1ProjectsProjectIdPutData, UpdateProjectEndpointApiV1ProjectsProjectIdPutResponses, UpdateProjectEndpointApiV1ProjectsProjectIdPutErrors, PlanProjectWithAiApiV1ProjectsProjectIdPlanPostData, PlanProjectWithAiApiV1ProjectsProjectIdPlanPostResponses, PlanProjectWithAiApiV1ProjectsProjectIdPlanPostErrors, PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostData, PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostResponses, PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostErrors, AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostData, AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostResponses, AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostErrors, AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostData, AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostResponses, AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostErrors, LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostData, LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostResponses, LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostErrors, GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetData, GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetResponses, GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetErrors, GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetData, GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetResponses, GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetErrors, ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostData, ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostResponses, ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostErrors, UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostData, UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostResponses, UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostErrors, GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetData, GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetResponses, GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetErrors, UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutData, UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutResponses, UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutErrors, DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostData, DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostResponses, DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostErrors, GetFilteredProjectsEndpointApiV1ProjectsFilteredGetData, GetFilteredProjectsEndpointApiV1ProjectsFilteredGetResponses, GetFilteredProjectsEndpointApiV1ProjectsFilteredGetErrors, GetAllProjectTagsEndpointApiV1ProjectsTagsGetData, GetAllProjectTagsEndpointApiV1ProjectsTagsGetResponses, UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutData, UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutResponses, UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutErrors, CreateTaskEndpointApiV1TasksPostData, CreateTaskEndpointApiV1TasksPostResponses, CreateTaskEndpointApiV1TasksPostErrors, DeleteTaskEndpointApiV1TasksTaskIdDeleteData, DeleteTaskEndpointApiV1TasksTaskIdDeleteResponses, DeleteTaskEndpointApiV1TasksTaskIdDeleteErrors, ReadTaskEndpointApiV1TasksTaskIdGetData, ReadTaskEndpointApiV1TasksTaskIdGetResponses, ReadTaskEndpointApiV1TasksTaskIdGetErrors, UpdateTaskEndpointApiV1TasksTaskIdPutData, UpdateTaskEndpointApiV1TasksTaskIdPutResponses, UpdateTaskEndpointApiV1TasksTaskIdPutErrors, RunAgentOnTaskApiV1TasksTaskIdRunAgentPostData, RunAgentOnTaskApiV1TasksTaskIdRunAgentPostResponses, RunAgentOnTaskApiV1TasksTaskIdRunAgentPostErrors, RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostData, RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostResponses, RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostErrors, GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetData, GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetResponses, GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetErrors, GetJobStatusApiV1JobsJobIdStatusGetData, GetJobStatusApiV1JobsJobIdStatusGetResponses, GetJobStatusApiV1JobsJobIdStatusGetErrors, GetJobResultApiV1JobsJobIdResultGetData, GetJobResultApiV1JobsJobIdResultGetResponses, GetJobResultApiV1JobsJobIdResultGetErrors, CancelJobApiV1JobsJobIdDeleteData, CancelJobApiV1JobsJobIdDeleteResponses, CancelJobApiV1JobsJobIdDeleteErrors, BatchJobStatusApiV1JobsStatusPostData, BatchJobStatusApiV1JobsStatusPostResponses, BatchJobStatusApiV1JobsStatusPostErrors, ListJobsApiV1JobsGetData, ListJobsApiV1JobsGetResponses, ListJobsApiV1JobsGetErrors, CreateTestJobApiV1JobsTestPostData, CreateTestJobApiV1JobsTestPostResponses, GetTemplatesApiV1TemplatesGetData, GetTemplatesApiV1TemplatesGetResponses, GetTemplatesApiV1TemplatesGetErrors, CreateTemplateApiV1TemplatesPostData, CreateTemplateApiV1TemplatesPostResponses, CreateTemplateApiV1TemplatesPostErrors, GetTemplateCategoriesApiV1TemplatesCategoriesGetData, GetTemplateCategoriesApiV1TemplatesCategoriesGetResponses, GetTemplateStatsApiV1TemplatesStatsGetData, GetTemplateStatsApiV1TemplatesStatsGetResponses, DeactivateTemplateApiV1TemplatesTemplateIdDeleteData, DeactivateTemplateApiV1TemplatesTemplateIdDeleteResponses, DeactivateTemplateApiV1TemplatesTemplateIdDeleteErrors, GetTemplateApiV1TemplatesTemplateIdGetData, GetTemplateApiV1TemplatesTemplateIdGetResponses, GetTemplateApiV1TemplatesTemplateIdGetErrors, UpdateTemplateApiV1TemplatesTemplateIdPutData, UpdateTemplateApiV1TemplatesTemplateIdPutResponses, UpdateTemplateApiV1TemplatesTemplateIdPutErrors, GetTemplateBySlugApiV1TemplatesSlugSlugGetData, GetTemplateBySlugApiV1TemplatesSlugSlugGetResponses, GetTemplateBySlugApiV1TemplatesSlugSlugGetErrors, PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostData, PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostResponses, PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostErrors, CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostData, CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostResponses, CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostErrors, ReadRootGetData, ReadRootGetResponses } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

/**
 * Health Check
 */
export const healthCheckHealthGet = <ThrowOnError extends boolean = false>(options?: Options<HealthCheckHealthGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<HealthCheckHealthGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/health',
        ...options
    });
};

/**
 * Health Check
 * Basic health check endpoint.
 *
 * Returns 200 if the service is healthy, 503 if any critical component is down.
 */
export const healthCheckApiV1HealthGet = <ThrowOnError extends boolean = false>(options?: Options<HealthCheckApiV1HealthGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<HealthCheckApiV1HealthGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/health',
        ...options
    });
};

/**
 * Detailed Health Check
 * Detailed health check with component status and metrics.
 *
 * Useful for monitoring dashboards and debugging.
 */
export const detailedHealthCheckApiV1HealthDetailedGet = <ThrowOnError extends boolean = false>(options?: Options<DetailedHealthCheckApiV1HealthDetailedGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<DetailedHealthCheckApiV1HealthDetailedGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/health/detailed',
        ...options
    });
};

/**
 * Liveness Probe
 * Kubernetes liveness probe endpoint.
 *
 * Simple check to verify the service is running.
 */
export const livenessProbeApiV1HealthLiveGet = <ThrowOnError extends boolean = false>(options?: Options<LivenessProbeApiV1HealthLiveGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<LivenessProbeApiV1HealthLiveGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/health/live',
        ...options
    });
};

/**
 * Readiness Probe
 * Kubernetes readiness probe endpoint.
 *
 * Checks if the service is ready to accept traffic.
 */
export const readinessProbeApiV1HealthReadyGet = <ThrowOnError extends boolean = false>(options?: Options<ReadinessProbeApiV1HealthReadyGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<ReadinessProbeApiV1HealthReadyGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/health/ready',
        ...options
    });
};

/**
 * Read Projects Endpoint
 */
export const readProjectsEndpointApiV1ProjectsGet = <ThrowOnError extends boolean = false>(options?: Options<ReadProjectsEndpointApiV1ProjectsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<ReadProjectsEndpointApiV1ProjectsGetResponses, ReadProjectsEndpointApiV1ProjectsGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/',
        ...options
    });
};

/**
 * Create Project Endpoint
 */
export const createProjectEndpointApiV1ProjectsPost = <ThrowOnError extends boolean = false>(options: Options<CreateProjectEndpointApiV1ProjectsPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateProjectEndpointApiV1ProjectsPostResponses, CreateProjectEndpointApiV1ProjectsPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Delete Project Endpoint
 * Supprime définitivement un projet et toutes ses tâches.
 *
 * ⚠️ ATTENTION: Cette action est irréversible. Le projet archivé doit être désarchivé avant suppression.
 */
export const deleteProjectEndpointApiV1ProjectsProjectIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteProjectEndpointApiV1ProjectsProjectIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteProjectEndpointApiV1ProjectsProjectIdDeleteResponses, DeleteProjectEndpointApiV1ProjectsProjectIdDeleteErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}',
        ...options
    });
};

/**
 * Read Project Endpoint
 */
export const readProjectEndpointApiV1ProjectsProjectIdGet = <ThrowOnError extends boolean = false>(options: Options<ReadProjectEndpointApiV1ProjectsProjectIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<ReadProjectEndpointApiV1ProjectsProjectIdGetResponses, ReadProjectEndpointApiV1ProjectsProjectIdGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}',
        ...options
    });
};

/**
 * Update Project Endpoint
 */
export const updateProjectEndpointApiV1ProjectsProjectIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateProjectEndpointApiV1ProjectsProjectIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateProjectEndpointApiV1ProjectsProjectIdPutResponses, UpdateProjectEndpointApiV1ProjectsProjectIdPutErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Plan Project With Ai
 */
export const planProjectWithAiApiV1ProjectsProjectIdPlanPost = <ThrowOnError extends boolean = false>(options: Options<PlanProjectWithAiApiV1ProjectsProjectIdPlanPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PlanProjectWithAiApiV1ProjectsProjectIdPlanPostResponses, PlanProjectWithAiApiV1ProjectsProjectIdPlanPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/plan',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Plan Project Async
 * Version asynchrone de la planification IA - POC Phase 1.3
 * Retourne immédiatement un job_id pour suivre la progression
 */
export const planProjectAsyncApiV1ProjectsProjectIdPlanAsyncPost = <ThrowOnError extends boolean = false>(options: Options<PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostResponses, PlanProjectAsyncApiV1ProjectsProjectIdPlanAsyncPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/plan-async',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Assemble And Refine Project Content
 */
export const assembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePost = <ThrowOnError extends boolean = false>(options: Options<AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostResponses, AssembleAndRefineProjectContentApiV1ProjectsProjectIdAssemblePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/assemble',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Assemble And Refine Project Content Async
 * Version asynchrone de l'assemblage IA - Fix code review
 * Retourne immédiatement un job_id pour suivre la progression
 */
export const assembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPost = <ThrowOnError extends boolean = false>(options: Options<AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostResponses, AssembleAndRefineProjectContentAsyncApiV1ProjectsProjectIdAssembleAsyncPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/assemble-async',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Launch Article Workflow
 * Lance un workflow complet de génération d'article
 *
 * Orchestration: Planning → Research Parallèle → Assembly → Finishing
 */
export const launchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePost = <ThrowOnError extends boolean = false>(options: Options<LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostResponses, LaunchArticleWorkflowApiV1ProjectsProjectIdWorkflowsGenerateArticlePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/workflows/generate-article',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get Workflow Status
 * Récupère le statut détaillé d'un workflow avec progression
 */
export const getWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGet = <ThrowOnError extends boolean = false>(options: Options<GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetResponses, GetWorkflowStatusApiV1ProjectsWorkflowsWorkflowIdStatusGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/workflows/{workflow_id}/status',
        ...options
    });
};

/**
 * Get Workflow Outputs
 * Récupère tous les outputs/résultats d'un workflow
 */
export const getWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGet = <ThrowOnError extends boolean = false>(options: Options<GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetResponses, GetWorkflowOutputsApiV1ProjectsWorkflowsWorkflowIdOutputsGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/workflows/{workflow_id}/outputs',
        ...options
    });
};

/**
 * Archive Project Endpoint
 * Archive un projet au lieu de le supprimer définitivement.
 *
 * L'archivage permet de masquer un projet tout en préservant ses données.
 */
export const archiveProjectEndpointApiV1ProjectsProjectIdArchivePost = <ThrowOnError extends boolean = false>(options: Options<ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostResponses, ArchiveProjectEndpointApiV1ProjectsProjectIdArchivePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/archive',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Unarchive Project Endpoint
 * Désarchive un projet pour le remettre en usage normal.
 */
export const unarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePost = <ThrowOnError extends boolean = false>(options: Options<UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostResponses, UnarchiveProjectEndpointApiV1ProjectsProjectIdUnarchivePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/unarchive',
        ...options
    });
};

/**
 * Get Project Settings Endpoint
 * Récupère les paramètres configurables d'un projet.
 */
export const getProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGet = <ThrowOnError extends boolean = false>(options: Options<GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetResponses, GetProjectSettingsEndpointApiV1ProjectsProjectIdSettingsGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/settings',
        ...options
    });
};

/**
 * Update Project Settings Endpoint
 * Met à jour les paramètres d'un projet.
 *
 * Les paramètres sont fusionnés avec les existants.
 */
export const updateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPut = <ThrowOnError extends boolean = false>(options: Options<UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutResponses, UpdateProjectSettingsEndpointApiV1ProjectsProjectIdSettingsPutErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/settings',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Duplicate Project Endpoint
 * Duplique un projet avec toutes ses tâches.
 *
 * Si aucun nom n'est fourni, ajoute "- Copie" au nom original.
 */
export const duplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePost = <ThrowOnError extends boolean = false>(options: Options<DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostResponses, DuplicateProjectEndpointApiV1ProjectsProjectIdDuplicatePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/duplicate',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get Filtered Projects Endpoint
 * Récupère les projets avec filtrage avancé.
 *
 * Permet de filtrer par statut d'archivage, tags, et avec pagination.
 */
export const getFilteredProjectsEndpointApiV1ProjectsFilteredGet = <ThrowOnError extends boolean = false>(options?: Options<GetFilteredProjectsEndpointApiV1ProjectsFilteredGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetFilteredProjectsEndpointApiV1ProjectsFilteredGetResponses, GetFilteredProjectsEndpointApiV1ProjectsFilteredGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/filtered',
        ...options
    });
};

/**
 * Get All Project Tags Endpoint
 * Récupère tous les tags utilisés dans les projets.
 *
 * Utile pour l'auto-complétion et les suggestions.
 */
export const getAllProjectTagsEndpointApiV1ProjectsTagsGet = <ThrowOnError extends boolean = false>(options?: Options<GetAllProjectTagsEndpointApiV1ProjectsTagsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetAllProjectTagsEndpointApiV1ProjectsTagsGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/tags',
        ...options
    });
};

/**
 * Update Project Tags Endpoint
 * Met à jour les tags d'un projet.
 *
 * Remplace complètement les tags existants.
 */
export const updateProjectTagsEndpointApiV1ProjectsProjectIdTagsPut = <ThrowOnError extends boolean = false>(options: Options<UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutResponses, UpdateProjectTagsEndpointApiV1ProjectsProjectIdTagsPutErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/projects/{project_id}/tags',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Create Task Endpoint
 */
export const createTaskEndpointApiV1TasksPost = <ThrowOnError extends boolean = false>(options: Options<CreateTaskEndpointApiV1TasksPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateTaskEndpointApiV1TasksPostResponses, CreateTaskEndpointApiV1TasksPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Delete Task Endpoint
 */
export const deleteTaskEndpointApiV1TasksTaskIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteTaskEndpointApiV1TasksTaskIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteTaskEndpointApiV1TasksTaskIdDeleteResponses, DeleteTaskEndpointApiV1TasksTaskIdDeleteErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/{task_id}',
        ...options
    });
};

/**
 * Read Task Endpoint
 */
export const readTaskEndpointApiV1TasksTaskIdGet = <ThrowOnError extends boolean = false>(options: Options<ReadTaskEndpointApiV1TasksTaskIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<ReadTaskEndpointApiV1TasksTaskIdGetResponses, ReadTaskEndpointApiV1TasksTaskIdGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/{task_id}',
        ...options
    });
};

/**
 * Update Task Endpoint
 */
export const updateTaskEndpointApiV1TasksTaskIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateTaskEndpointApiV1TasksTaskIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateTaskEndpointApiV1TasksTaskIdPutResponses, UpdateTaskEndpointApiV1TasksTaskIdPutErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/{task_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Run Agent On Task
 */
export const runAgentOnTaskApiV1TasksTaskIdRunAgentPost = <ThrowOnError extends boolean = false>(options: Options<RunAgentOnTaskApiV1TasksTaskIdRunAgentPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<RunAgentOnTaskApiV1TasksTaskIdRunAgentPostResponses, RunAgentOnTaskApiV1TasksTaskIdRunAgentPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/{task_id}/run-agent',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Run Agent On Task Async
 * Version asynchrone de l'exécution d'agents IA - Phase 2.1 Anti-Pattern Fix
 * Dispatch direct vers les tâches spécialisées (plus de meta-task bloquante)
 * Retourne immédiatement un job_id pour suivre la progression
 */
export const runAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPost = <ThrowOnError extends boolean = false>(options: Options<RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostResponses, RunAgentOnTaskAsyncApiV1TasksTaskIdRunAgentAsyncPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/{task_id}/run-agent-async',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get Tasks For Project Endpoint
 */
export const getTasksForProjectEndpointApiV1TasksProjectProjectIdGet = <ThrowOnError extends boolean = false>(options: Options<GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetResponses, GetTasksForProjectEndpointApiV1TasksProjectProjectIdGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/tasks/project/{project_id}',
        ...options
    });
};

/**
 * Get Job Status
 * Récupérer le statut d'un job asynchrone
 */
export const getJobStatusApiV1JobsJobIdStatusGet = <ThrowOnError extends boolean = false>(options: Options<GetJobStatusApiV1JobsJobIdStatusGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetJobStatusApiV1JobsJobIdStatusGetResponses, GetJobStatusApiV1JobsJobIdStatusGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/{job_id}/status',
        ...options
    });
};

/**
 * Get Job Result
 * Récupérer le résultat d'un job terminé
 */
export const getJobResultApiV1JobsJobIdResultGet = <ThrowOnError extends boolean = false>(options: Options<GetJobResultApiV1JobsJobIdResultGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetJobResultApiV1JobsJobIdResultGetResponses, GetJobResultApiV1JobsJobIdResultGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/{job_id}/result',
        ...options
    });
};

/**
 * Cancel Job
 * Annuler un job en cours (si possible)
 */
export const cancelJobApiV1JobsJobIdDelete = <ThrowOnError extends boolean = false>(options: Options<CancelJobApiV1JobsJobIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<CancelJobApiV1JobsJobIdDeleteResponses, CancelJobApiV1JobsJobIdDeleteErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/{job_id}',
        ...options
    });
};

/**
 * Batch Job Status
 * Get status for multiple jobs in a single request (batch operation).
 * Optimized to avoid N+1 queries.
 */
export const batchJobStatusApiV1JobsStatusPost = <ThrowOnError extends boolean = false>(options: Options<BatchJobStatusApiV1JobsStatusPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<BatchJobStatusApiV1JobsStatusPostResponses, BatchJobStatusApiV1JobsStatusPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/status',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * List Jobs
 * Lister les jobs avec filtres optionnels
 */
export const listJobsApiV1JobsGet = <ThrowOnError extends boolean = false>(options?: Options<ListJobsApiV1JobsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<ListJobsApiV1JobsGetResponses, ListJobsApiV1JobsGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/',
        ...options
    });
};

/**
 * Create Test Job
 * Endpoint de test pour créer un job de démonstration
 * Utile pour tester l'infrastructure async sans dépendre de l'IA
 */
export const createTestJobApiV1JobsTestPost = <ThrowOnError extends boolean = false>(options?: Options<CreateTestJobApiV1JobsTestPostData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<CreateTestJobApiV1JobsTestPostResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/jobs/test',
        ...options
    });
};

/**
 * Get Templates
 * Récupère la liste des templates disponibles avec filtres optionnels.
 *
 * - **category**: Guide, Opinion, Analyse, etc.
 * - **difficulty**: Facile, Moyen, Avancé
 * - **tone**: Pratique, Personnel, Analytique
 * - **active_only**: Exclure les templates désactivés
 */
export const getTemplatesApiV1TemplatesGet = <ThrowOnError extends boolean = false>(options?: Options<GetTemplatesApiV1TemplatesGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetTemplatesApiV1TemplatesGetResponses, GetTemplatesApiV1TemplatesGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/',
        ...options
    });
};

/**
 * Create Template
 * Crée un nouveau template de blog.
 *
 * Réservé aux administrateurs.
 */
export const createTemplateApiV1TemplatesPost = <ThrowOnError extends boolean = false>(options: Options<CreateTemplateApiV1TemplatesPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateTemplateApiV1TemplatesPostResponses, CreateTemplateApiV1TemplatesPostErrors, ThrowOnError>({
        responseType: 'json',
        security: [
            {
                name: 'X-API-KEY',
                type: 'apiKey'
            }
        ],
        url: '/api/v1/templates/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get Template Categories
 * Récupère la liste des catégories de templates disponibles.
 *
 * Utile pour créer des filtres dans l'interface.
 */
export const getTemplateCategoriesApiV1TemplatesCategoriesGet = <ThrowOnError extends boolean = false>(options?: Options<GetTemplateCategoriesApiV1TemplatesCategoriesGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetTemplateCategoriesApiV1TemplatesCategoriesGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/categories',
        ...options
    });
};

/**
 * Get Template Stats
 * Récupère les statistiques des templates.
 *
 * Retourne:
 * - Nombre total de templates
 * - Distribution par difficulté
 * - Templates style Boulet
 * - Catégories disponibles
 */
export const getTemplateStatsApiV1TemplatesStatsGet = <ThrowOnError extends boolean = false>(options?: Options<GetTemplateStatsApiV1TemplatesStatsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetTemplateStatsApiV1TemplatesStatsGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/stats',
        ...options
    });
};

/**
 * Deactivate Template
 * Désactive un template (soft delete).
 *
 * Réservé aux administrateurs.
 */
export const deactivateTemplateApiV1TemplatesTemplateIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeactivateTemplateApiV1TemplatesTemplateIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeactivateTemplateApiV1TemplatesTemplateIdDeleteResponses, DeactivateTemplateApiV1TemplatesTemplateIdDeleteErrors, ThrowOnError>({
        responseType: 'json',
        security: [
            {
                name: 'X-API-KEY',
                type: 'apiKey'
            }
        ],
        url: '/api/v1/templates/{template_id}',
        ...options
    });
};

/**
 * Get Template
 * Récupère un template spécifique par son ID.
 */
export const getTemplateApiV1TemplatesTemplateIdGet = <ThrowOnError extends boolean = false>(options: Options<GetTemplateApiV1TemplatesTemplateIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetTemplateApiV1TemplatesTemplateIdGetResponses, GetTemplateApiV1TemplatesTemplateIdGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/{template_id}',
        ...options
    });
};

/**
 * Update Template
 * Met à jour un template existant.
 *
 * Réservé aux administrateurs.
 */
export const updateTemplateApiV1TemplatesTemplateIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateTemplateApiV1TemplatesTemplateIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateTemplateApiV1TemplatesTemplateIdPutResponses, UpdateTemplateApiV1TemplatesTemplateIdPutErrors, ThrowOnError>({
        responseType: 'json',
        security: [
            {
                name: 'X-API-KEY',
                type: 'apiKey'
            }
        ],
        url: '/api/v1/templates/{template_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get Template By Slug
 * Récupère un template par son slug unique.
 *
 * Utile pour les URLs propres dans l'interface.
 */
export const getTemplateBySlugApiV1TemplatesSlugSlugGet = <ThrowOnError extends boolean = false>(options: Options<GetTemplateBySlugApiV1TemplatesSlugSlugGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetTemplateBySlugApiV1TemplatesSlugSlugGetResponses, GetTemplateBySlugApiV1TemplatesSlugSlugGetErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/slug/{slug}',
        ...options
    });
};

/**
 * Preview Template Tasks Endpoint
 * Génère un aperçu des tâches qui seraient créées avec ce template et cette personnalisation.
 *
 * Permet de prévisualiser sans créer effectivement le projet.
 */
export const previewTemplateTasksEndpointApiV1TemplatesPreviewTasksPost = <ThrowOnError extends boolean = false>(options: Options<PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostResponses, PreviewTemplateTasksEndpointApiV1TemplatesPreviewTasksPostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/preview-tasks',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Create Project From Template
 * Crée un nouveau projet basé sur un template avec personnalisation.
 *
 * Le projet créé contiendra toutes les tâches pré-définies selon
 * le template choisi et les options de personnalisation.
 */
export const createProjectFromTemplateApiV1TemplatesProjectsFromTemplatePost = <ThrowOnError extends boolean = false>(options: Options<CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostResponses, CreateProjectFromTemplateApiV1TemplatesProjectsFromTemplatePostErrors, ThrowOnError>({
        responseType: 'json',
        url: '/api/v1/templates/projects/from-template',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Read Root
 */
export const readRootGet = <ThrowOnError extends boolean = false>(options?: Options<ReadRootGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<ReadRootGetResponses, unknown, ThrowOnError>({
        responseType: 'json',
        url: '/',
        ...options
    });
};
