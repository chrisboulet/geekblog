import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import RichTextEditor from '../editor/RichTextEditor';
import { Project, Task as ApiTask } from '../../types/api';
import * as api from '../../lib/api'; // Pour appeler le futur endpoint /assemble
import axios from 'axios'; // Import manquant

interface AssemblyViewProps {
  project: Project;
}

const AssemblyView: React.FC<AssemblyViewProps> = ({ project }) => {
  const queryClient = useQueryClient();
  const [orderedTasks, setOrderedTasks] = useState<ApiTask[]>([]);
  const [assembledContent, setAssembledContent] = useState<string>('');
  const [refinedContent, setRefinedContent] = useState<string>('');

  // Filtrer et trier les tâches éligibles pour l'assemblage
  useEffect(() => {
    const eligibleStatuses = ["Terminé", "Révision"]; // Statuts considérés comme prêts pour l'assemblage
    const tasksForAssembly = project.tasks
      .filter(task => eligibleStatuses.includes(task.status || ''))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setOrderedTasks(tasksForAssembly);
  }, [project.tasks]);

  // Mettre à jour le contenu assemblé brut lorsque les tâches ordonnées changent
  useEffect(() => {
    const rawHtmlContent = orderedTasks.map(task =>
      `<h2>${task.title}</h2>\n${task.description || '<p>Contenu non disponible.</p>'}`
    ).join('<hr class="my-4 border-neutral-700">\n');
    setAssembledContent(rawHtmlContent);
    setRefinedContent(''); // Réinitialiser le contenu raffiné si les tâches sources changent
  }, [orderedTasks]);

  // Mutation pour lancer le "Crew de Finition" IA
  const refinementMutation = useMutation({
    mutationFn: (rawContent: string) => {
      return api.runFinishingCrew(project.id, rawContent); // Appel de la fonction API réelle
    },
    onSuccess: (data) => {
      setRefinedContent(data);
      // Optionnel: Invalider des queries si le raffinage affecte d'autres données du projet
      // queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      console.log("Raffinage IA terminé.");
    },
    onError: (error) => {
      console.error("Erreur lors du raffinage IA:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du raffinage.';
      // Tenter de parser si l'erreur est une réponse HTTP d'erreur de FastAPI
      let detailMessage = errorMessage;
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        detailMessage = typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail);
      }
      setRefinedContent(`<p class="text-red-400 bg-red-900/30 p-2 rounded"><strong>Erreur de raffinage:</strong> ${detailMessage}</p>`);
    }
  });


  const handleStartRefinement = () => {
    if (assembledContent) {
      refinementMutation.mutate(assembledContent);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full space-y-4 md:space-y-0 md:space-x-4 p-1">
      {/* Panneau de gauche: Liste des tâches à assembler */}
      <div className="md:w-1/3 h-full bg-bg-secondary p-4 rounded-lg shadow-lg flex flex-col">
        <h2 className="text-xl font-semibold text-neural-blue mb-4 border-b border-neutral-700 pb-2">
          Tâches à Assembler ({orderedTasks.length})
        </h2>
        <p className="text-xs text-text-tertiary mb-3">
          Seules les tâches avec le statut "Terminé" ou "Révision" sont listées ici.
          L'ordre est basé sur la propriété 'order' des tâches. (Glisser-déposer à venir)
        </p>
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {orderedTasks.length > 0 ? (
            orderedTasks.map((task, index) => (
              <div key={task.id} className="bg-bg-primary p-3 rounded-md border border-neutral-700/80">
                <h3 className="font-medium text-text-primary text-sm truncate">
                  <span className="text-neural-pink mr-2">{task.order}.</span>{task.title}
                </h3>
                <p className="text-xs text-text-tertiary mt-1">Statut: {task.status}</p>
              </div>
            ))
          ) : (
            <p className="text-text-secondary text-center py-6">Aucune tâche prête pour l'assemblage.</p>
          )}
        </div>
      </div>

      {/* Panneau de droite: Éditeur pour l'aperçu et le résultat du raffinage */}
      <div className="md:w-2/3 h-full bg-bg-secondary p-4 rounded-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neural-green">
            {refinementMutation.isPending ? 'Raffinage en cours...' : refinedContent ? 'Contenu Raffiné' : 'Aperçu Assemblé Brut'}
          </h2>
          <button
            onClick={handleStartRefinement}
            disabled={!assembledContent || refinementMutation.isPending}
            className="px-4 py-2 rounded-md font-semibold bg-neural-green text-bg-primary hover:bg-opacity-80 transition-all duration-150 ease-in-out shadow-neural-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refinementMutation.isPending ? 'Raffinage...' : 'Lancer le Raffinage IA'}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <RichTextEditor
            key={refinedContent ? 'refined' : 'assembled'} // Pour forcer le re-montage et l'update du contenu
            initialContent={refinedContent || assembledContent}
            editable={false} // Lecture seule pour l'instant
            placeholder="Le contenu assemblé ou raffiné apparaîtra ici."
          />
        </div>
        {refinementMutation.error && (
           <p className="text-xs text-red-400 mt-2">Erreur: {refinementMutation.error.message}</p>
        )}
      </div>
    </div>
  );
};

export default AssemblyView;
