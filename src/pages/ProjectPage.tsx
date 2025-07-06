import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import NavigationHeader from '../components/navigation/NavigationHeader';
import ViewSwitcher from '../components/navigation/ViewSwitcher';
import NeuralCanvas from '../components/neural/NeuralCanvas';
import NeuralBackground from '../components/neural/NeuralBackground';
import AssemblyView from '../components/assembly/AssemblyView';
import OnboardingOverlay from '../components/onboarding/OnboardingOverlay';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import JobProgressBar from '../components/ui/JobProgressBar';
import JobStatusBadge from '../components/ui/JobStatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProjectStatus from '../components/ui/ProjectStatus';

type ViewMode = 'neural' | 'assembly';

const ProjectPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('neural');
  const [useAsyncPlanning, setUseAsyncPlanning] = useState(true); // Default to async planning
  const [isSimpleMode, setIsSimpleMode] = useState(true); // Default to simple mode for better UX
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
  
  // Convertir l'ID en nombre et valider
  const projectIdNumber = projectId ? parseInt(projectId, 10) : null;
  
  if (!projectIdNumber || isNaN(projectIdNumber)) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-xl text-red-500">
        ID de projet invalide: {projectId}
      </div>
    );
  }

  // Récupérer les données du projet
  const { data: project, isLoading: isLoadingProject, error: projectError, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectIdNumber],
    queryFn: () => api.getProject(projectIdNumber),
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
      console.log("Planification IA terminée, projet mis à jour:", updatedProjectData);
    },
    onError: (error) => {
      console.error("Erreur lors de la planification IA:", error);
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
        console.log(`Async planning completed for project ${project?.id}:`, result);
        // Could show success notification here
      },
      onError: (error) => {
        console.error(`Async planning failed for project ${project?.id}:`, error);
        // Could show error notification here
      }
    }
  );

  // Helper functions
  const handlePlanProject = () => {
    if (useAsyncPlanning) {
      asyncPlanningOperation.execute({});
    } else {
      planProjectMutation.mutate();
    }
  };

  // Determine which operation is currently active
  const isPlanningInProgress = useAsyncPlanning 
    ? asyncPlanningOperation.isExecuting 
    : planProjectMutation.isPending;
  
  const planningError = useAsyncPlanning 
    ? asyncPlanningOperation.error 
    : (planProjectMutation.error instanceof Error ? planProjectMutation.error.message : null);

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

  // Check if this is the user's first visit to show onboarding
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('geekblog-onboarding-completed');
    if (!hasSeenOnboarding && currentView === 'neural') {
      setShowOnboarding(true);
    }
  }, [currentView]);

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
            {/* View Switcher */}
            <ViewSwitcher 
              currentView={currentView}
              onViewChange={setCurrentView}
              isSimpleMode={isSimpleMode}
              onToggleSimpleMode={setIsSimpleMode}
            />
            
            {/* AI Planning Controls */}
            <div className="flex gap-2 items-center">
              {/* Planning mode toggle */}
              <button
                onClick={() => setUseAsyncPlanning(!useAsyncPlanning)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out ${
                  useAsyncPlanning 
                    ? 'bg-neural-blue/20 text-neural-blue border border-neural-blue' 
                    : 'bg-neural-purple/20 text-neural-purple border border-neural-purple'
                }`}
                title={`Basculer vers le mode ${useAsyncPlanning ? 'synchrone' : 'asynchrone'}`}
              >
                {useAsyncPlanning ? 'Async' : 'Sync'}
              </button>

              {/* Main planning button */}
              <button
                onClick={handlePlanProject}
                disabled={isPlanningInProgress}
                className="neural-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isPlanningInProgress && <LoadingSpinner size="sm" color="white" />}
                <span>
                  {isPlanningInProgress 
                    ? (useAsyncPlanning && asyncPlanningOperation.step 
                        ? asyncPlanningOperation.step 
                        : 'Planification IA...'
                      )
                    : "Planifier avec l'IA"
                  }
                </span>
              </button>

              {/* Cancel button for async operations */}
              {useAsyncPlanning && asyncPlanningOperation.jobId && asyncPlanningOperation.isPolling && (
                <button
                  onClick={() => asyncPlanningOperation.cancel()}
                  className="px-3 py-2 rounded-md font-medium bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30 transition-all duration-150 ease-in-out"
                  title="Annuler la planification"
                >
                  Annuler
                </button>
              )}
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
              onSaveContent={(content, title) => {
                console.log('Saving Neural Flow content:', { title, content });
                // TODO: Implement save to project/task
              }}
              onCreateNode={(type, position) => {
                console.log('Creating Neural Node:', { type, position });
                // TODO: Implement create task from node
              }}
            />
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
