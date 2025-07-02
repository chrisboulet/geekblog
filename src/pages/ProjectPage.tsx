import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import AssemblyView from '../components/assembly/AssemblyView';

type ViewMode = 'kanban' | 'assembly';

const ProjectPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
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

  // Mutation pour la planification IA
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

  return (
    <div className="p-4 md:p-8 h-full flex flex-col text-text-primary bg-bg-primary">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neural-purple truncate">
          Projet: <span className="text-text-primary">{project.name}</span>
          <span className="text-sm text-text-tertiary ml-2">(ID: {project.id})</span>
        </h1>
        <div className="flex space-x-2 items-center">
          <button
            onClick={() => planProjectMutation.mutate()}
            disabled={planProjectMutation.isPending}
            className="px-4 py-2 rounded-md font-semibold bg-neural-blue text-white hover:bg-opacity-80 transition-all duration-150 ease-in-out shadow-neural-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {planProjectMutation.isPending ? 'Planification IA...' : "Planifier avec l'IA"}
          </button>
          <button
            onClick={() => setCurrentView('kanban')}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 ease-in-out
                        ${currentView === 'kanban' ? 'bg-neural-pink text-white shadow-neural-glow-pink' : 'bg-bg-secondary hover:bg-neural-blue/30'}`}
          >
            Vue Kanban
          </button>
          <button
            onClick={() => setCurrentView('assembly')}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 ease-in-out
                        ${currentView === 'assembly' ? 'bg-neural-pink text-white shadow-neural-glow-pink' : 'bg-bg-secondary hover:bg-neural-blue/30'}`}
          >
            Vue Assemblage
          </button>
        </div>
      </div>
      {project.description && (
        <p className="mb-6 text-text-secondary italic">{project.description}</p>
      )}
      {planProjectMutation.error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
          Erreur de planification IA: {planProjectMutation.error instanceof Error ? planProjectMutation.error.message : JSON.stringify(planProjectMutation.error)}
        </div>
      )}

      <div className="flex-grow overflow-auto">
        {currentView === 'kanban' && (
          <KanbanBoard project={project} /> {/* Passer le projet entier au KanbanBoard */}
        )}
        {currentView === 'assembly' && (
          <AssemblyView project={project} /> // Remplacement du placeholder
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
