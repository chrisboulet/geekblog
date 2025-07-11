import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import NavigationHeader from '../components/navigation/NavigationHeader';
import ViewSwitcher from '../components/navigation/ViewSwitcher';
import NeuralCanvas from '../components/neural/NeuralCanvas';
import NeuralBackground from '../components/neural/NeuralBackground';
import AssemblyView from '../components/assembly/AssemblyView';
import TaskListView from '../components/task/TaskListView';
import OnboardingOverlay from '../components/onboarding/OnboardingOverlay';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import JobProgressBar from '../components/ui/JobProgressBar';
import JobStatusBadge from '../components/ui/JobStatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProjectStatus from '../components/ui/ProjectStatus';
import TaskCreateButton from '../components/task/TaskCreateButton';
import { useToastActions } from '../components/ui/Toast';

type ViewMode = 'neural' | 'assembly' | 'tasks';

const ProjectPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('neural');
  const [useAsyncPlanning, setUseAsyncPlanning] = useState(true); // Default to async planning
  const [isSimpleMode, setIsSimpleMode] = useState(true); // Default to simple mode for better UX
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToastActions();
  const { projectId } = useParams<{ projectId: string }>();
  
  // Convertir l'ID en nombre et valider
  const projectIdNumber = projectId ? parseInt(projectId, 10) : null;
  
  // Validation early return MUST be before any hooks
  if (!projectIdNumber || isNaN(projectIdNumber)) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-xl text-red-500">
        ID de projet invalide: {projectId}
      </div>
    );
  }
  
  // Récupérer les données du projet - Safe now that projectIdNumber is validated
  const { data: project, isLoading: isLoadingProject, error: projectError, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectIdNumber],
    queryFn: () => api.getProject(projectIdNumber), // No need for ! assertion anymore
    enabled: !!projectIdNumber,
  });

  // Les tâches sont incluses dans la réponse de getProject selon nos types API
  // Si ce n'était pas le cas, on ferait un autre useQuery pour api.getTasksByProject(projectIdNumber)

  // Existing sync mutation (preserved for backward compatibility)
  const planProjectMutation = useMutation({
    mutationFn: () => {
      if (!project) throw new Error("Projet non chargé pour la planification.");
      // Utiliser project.description comme but si l'utilisateur ne fournit pas un but spécifique.
      // Pour une version plus avancée, on pourrait avoir un champ de saisie pour `projectGoal`.
      return api.planProject(project.id, project.description || project.name);
    },
    onSuccess: (updatedProjectData) => {
      queryClient.setQueryData(['project', updatedProjectData.id], updatedProjectData);
      // ou queryClient.invalidateQueries({ queryKey: ['project', updatedProjectData.id] }); pour forcer un refetch complet
      // Cela mettra à jour l'UI avec les nouvelles tâches.
      // On pourrait aussi afficher une notification de succès.
      // TODO: Show success notification to user about planning completion
    },
    onError: (error) => {
      // TODO: Show error notification to user about planning failure
      // Afficher une notification d'erreur à l'utilisateur.
      // L'erreur est déjà gérée pour l'affichage dans le JSX.
    },
  });

  // New async planning operation
  const asyncPlanningOperation = useAsyncOperation(
    () => {
      if (!project) throw new Error("Projet non chargé pour la planification.");
      return api.planProjectAsync(project.id, project.description || project.name);
    },
    {
      invalidateQueries: [['project', String(projectIdNumber)]],
      onSuccess: (result) => {
        // TODO: Show success notification to user about async planning completion
        // Could show success notification here
      },
      onError: (error) => {
        // TODO: Show error notification to user about async planning failure
        // Could show error notification here
      }
    }
  );

  // Check if this is the user's first visit to show onboarding - MOVED HERE before conditional returns
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('geekblog-onboarding-completed');
    if (!hasSeenOnboarding && currentView === 'neural') {
      setShowOnboarding(true);
    }
  }, [currentView]);

  // Mutation for updating project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: api.ProjectUpdate }) => 
      api.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['project', updatedProject.id], updatedProject);
    },
  });

  // Mutation for creating tasks
  const createTaskMutation = useMutation({
    mutationFn: (taskData: api.TaskCreate) => api.createTask(taskData),
    onSuccess: () => {
      // Invalidate project query to refetch with new tasks
      queryClient.invalidateQueries({ queryKey: ['project', projectIdNumber] });
    },
  });

  // Helper functions
  const handlePlanProject = () => {
    // Redirect to new integrated planning interface
    setCurrentView('tasks');
    
    // Show informative message about the new planning interface
    setTimeout(() => {
      toast.info('🚀 Nouvelle interface de planification ! Utilisez le bouton "Planifier avec IA" ci-dessus pour bénéficier de la planification intelligente améliorée.');
    }, 500);
  };

  const handleSaveContent = (content: string, title: string) => {
    if (!project) return;
    
    // Update project description with the neural flow content
    const updatedDescription = `${title ? title + '\n\n' : ''}${content}`;
    updateProjectMutation.mutate({
      id: project.id,
      data: { description: updatedDescription }
    });
  };

  const handleCreateNode = (type: 'idea' | 'category' | 'tag', position: { x: number; y: number }) => {
    if (!project) return;

    // Create a new task based on the node type
    const taskTitle = type === 'idea' ? 'New Idea' : 
                     type === 'category' ? 'New Category' : 'New Tag';
    
    createTaskMutation.mutate({
      project_id: project.id,
      title: taskTitle,
      description: `Created from Neural Canvas at position ${position.x}, ${position.y}`,
      status: 'pending'
    });
  };

  // Determine which operation is currently active
  const isPlanningInProgress = useAsyncPlanning 
    ? asyncPlanningOperation.isExecuting 
    : planProjectMutation.isPending;
  
  const planningError = useAsyncPlanning 
    ? asyncPlanningOperation.error 
    : (planProjectMutation.error instanceof Error ? planProjectMutation.error.message : null);

  // Early returns for loading states

  if (isLoadingProject) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-xl text-text-secondary">
        Chargement du projet...
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-xl text-red-500">
        <p>Erreur lors du chargement du projet:</p>
        <pre className="text-sm mt-2 bg-bg-secondary p-2 rounded">
          {projectError instanceof Error ? projectError.message : JSON.stringify(projectError)}
        </pre>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 h-full flex items-center justify-center text-xl text-text-secondary">Projet non trouvé.</div>;
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('geekblog-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('geekblog-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="relative h-full flex flex-col text-text-primary" style={{ background: 'var(--bg-primary)' }}>
      {/* Neural Background */}
      <NeuralBackground />
      
      {/* Navigation Header */}
      <NavigationHeader 
        projectName={project.name}
        projectId={project.id}
        currentView={currentView}
      />
      
      {/* Main Content with Neural styling */}
      <div className="relative z-10 p-4 md:p-8 h-full flex flex-col">
        {/* Project Info and View Switcher */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="neural-text-gradient">{project.name}</span>
            </h1>
            {project.description && (
              <p className="text-text-secondary italic text-sm md:text-base">{project.description}</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Task Management */}
            <TaskCreateButton projectId={projectIdNumber} />
            
            {/* View Switcher */}
            <ViewSwitcher 
              currentView={currentView}
              onViewChange={setCurrentView}
              isSimpleMode={isSimpleMode}
              onToggleSimpleMode={setIsSimpleMode}
            />
            
            {/* AI Planning Controls */}
            <div className="flex gap-2 items-center">
              {/* New interface indicator */}
              <div className="px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded-md text-sm font-medium">
                ✨ Interface Améliorée
              </div>

              {/* Main planning button - redirects to new interface */}
              <button
                onClick={handlePlanProject}
                className="neural-button-primary flex items-center space-x-2"
                title="Accéder à la nouvelle interface de planification intelligente"
              >
                <span>🚀 Nouvelle Planification IA</span>
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Cancel button no longer needed with new integrated interface */}
            </div>
          </div>
        </div>

        {/* Project Status Indicator */}
        <div className="mb-6">
          <ProjectStatus project={project} />
        </div>

      {/* Async planning progress */}
      {useAsyncPlanning && asyncPlanningOperation.status && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <JobStatusBadge 
              status={asyncPlanningOperation.status} 
              size="md" 
              showProgress={true}
            />
            <span className="text-sm text-text-tertiary">
              Mode: Planification asynchrone
            </span>
          </div>
          <JobProgressBar 
            status={asyncPlanningOperation.status}
            size="md"
            showStep={true}
            showTimeRemaining={true}
          />
        </div>
      )}

      {/* Error display for both sync and async */}
      {planningError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
          Erreur de planification IA: {planningError}
        </div>
      )}

        <div className="flex-grow overflow-hidden">
          {currentView === 'neural' && (
            <NeuralCanvas 
              project={project}
              isSimpleMode={isSimpleMode}
              onSaveContent={handleSaveContent}
              onCreateNode={handleCreateNode}
            />
          )}
          {currentView === 'tasks' && (
            <TaskListView project={project} />
          )}
          {currentView === 'assembly' && (
            <AssemblyView project={project} />
          )}
        </div>
      </div>

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </div>
  );
};

export default ProjectPage;
