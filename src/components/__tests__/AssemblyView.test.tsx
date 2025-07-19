import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render, mockProject, mockTasks } from '../../test/test-utils'
import AssemblyView from '../assembly/AssemblyView'
import * as api from '../../lib/api'

// Mock du composant RichTextEditor
vi.mock('../editor/RichTextEditor', () => ({
  default: ({ initialContent, onContentChange }: { initialContent: string, onContentChange?: (content: string) => void }) => (
    <div data-testid="rich-text-editor">
      <textarea
        data-testid="editor-content"
        value={initialContent}
        onChange={(e) => onContentChange?.(e.target.value)}
      />
    </div>
  )
}))

// Mock du module API
vi.mock('../../lib/api', () => ({
  runFinishingCrew: vi.fn(),
}))

const mockApiClient = api as any

describe('AssemblyView', () => {
  // Tâches avec différents statuts pour les tests
  const completedTasks = [
    { ...mockTasks[0], status: 'Terminé', order: 1, title: 'Introduction', description: 'Contenu introduction' },
    { ...mockTasks[1], status: 'Révision', order: 2, title: 'Développement', description: 'Contenu développement' },
    { ...mockTasks[2], status: 'Terminé', order: 3, title: 'Conclusion', description: 'Contenu conclusion' },
    { ...mockTasks[3], status: 'À faire', order: 4, title: 'Non terminé', description: 'Pas prêt' }
  ]

  const projectWithCompletedTasks = {
    ...mockProject,
    tasks: completedTasks
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders two-panel layout correctly', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    expect(screen.getByText('Ordre des Sections')).toBeInTheDocument()
    expect(screen.getByText('Aperçu de l\'Article')).toBeInTheDocument()
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
  })

  it('filters and displays only eligible tasks', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    // Devrait afficher les tâches "Terminé" et "Révision"
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Développement')).toBeInTheDocument()
    expect(screen.getByText('Conclusion')).toBeInTheDocument()

    // Ne devrait pas afficher la tâche "À faire"
    expect(screen.queryByText('Non terminé')).not.toBeInTheDocument()
  })

  it('sorts tasks by order correctly', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    const taskElements = screen.getAllByTestId(/task-item/)

    // Vérifier l'ordre des tâches
    expect(taskElements[0]).toHaveTextContent('Introduction')
    expect(taskElements[1]).toHaveTextContent('Développement')
    expect(taskElements[2]).toHaveTextContent('Conclusion')
  })

  it('assembles content correctly in HTML format', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    const editorContent = screen.getByTestId('editor-content')

    // Vérifier que le contenu assemblé contient les éléments attendus
    expect(editorContent.value).toContain('<h2>Introduction</h2>')
    expect(editorContent.value).toContain('Contenu introduction')
    expect(editorContent.value).toContain('<h2>Développement</h2>')
    expect(editorContent.value).toContain('Contenu développement')
    expect(editorContent.value).toContain('<hr class="my-4 border-neutral-700">')
  })

  it('handles empty tasks gracefully', () => {
    const emptyProject = { ...mockProject, tasks: [] }
    render(<AssemblyView project={emptyProject} />)

    expect(screen.getByText('Ordre des Sections')).toBeInTheDocument()
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent.value).toBe('')
  })

  it('shows "Lancer le Raffinage IA" button', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    expect(screen.getByText('Lancer le Raffinage IA')).toBeInTheDocument()
  })

  it('calls finishing crew API when refine button is clicked', async () => {
    mockApiClient.runFinishingCrew.mockResolvedValue('Contenu raffiné par l\'IA')

    render(<AssemblyView project={projectWithCompletedTasks} />)

    const refineButton = screen.getByText('Lancer le Raffinage IA')
    fireEvent.click(refineButton)

    await waitFor(() => {
      expect(mockApiClient.runFinishingCrew).toHaveBeenCalledWith(
        projectWithCompletedTasks.id,
        expect.stringContaining('<h2>Introduction</h2>')
      )
    })
  })

  it('updates editor with refined content after successful API call', async () => {
    const refinedContent = 'Article raffiné et amélioré par l\'IA'
    mockApiClient.runFinishingCrew.mockResolvedValue(refinedContent)

    render(<AssemblyView project={projectWithCompletedTasks} />)

    const refineButton = screen.getByText('Lancer le Raffinage IA')
    fireEvent.click(refineButton)

    await waitFor(() => {
      const editorContent = screen.getByTestId('editor-content')
      expect(editorContent.value).toBe(refinedContent)
    })
  })

  it('shows loading state during API call', async () => {
    // Mock d'une promesse qui ne se résout pas immédiatement
    let resolvePromise: (value: any) => void
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockApiClient.runFinishingCrew.mockReturnValue(pendingPromise)

    render(<AssemblyView project={projectWithCompletedTasks} />)

    const refineButton = screen.getByText('Lancer le Raffinage IA')
    fireEvent.click(refineButton)

    // Vérifier l'état de chargement
    await waitFor(() => {
      expect(screen.getByText('Raffinage en cours...')).toBeInTheDocument()
      expect(refineButton).toBeDisabled()
    })

    // Résoudre la promesse
    resolvePromise!('Contenu raffiné')

    // Vérifier que le loading disparaît
    await waitFor(() => {
      expect(screen.queryByText('Raffinage en cours...')).not.toBeInTheDocument()
      expect(refineButton).not.toBeDisabled()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApiClient.runFinishingCrew.mockRejectedValue(new Error('API Error'))

    render(<AssemblyView project={projectWithCompletedTasks} />)

    const refineButton = screen.getByText('Lancer le Raffinage IA')
    fireEvent.click(refineButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors du raffinage IA:',
        expect.any(Error)
      )
    })

    // Vérifier qu'un message d'erreur est affiché
    expect(screen.getByText(/Erreur lors du raffinage/)).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('handles tasks without description', () => {
    const tasksWithoutDescription = [
      { ...mockTasks[0], status: 'Terminé', description: null, title: 'Sans description' }
    ]
    const projectWithEmptyTasks = {
      ...mockProject,
      tasks: tasksWithoutDescription
    }

    render(<AssemblyView project={projectWithEmptyTasks} />)

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent.value).toContain('<h2>Sans description</h2>')
    expect(editorContent.value).toContain('<p>Contenu non disponible.</p>')
  })

  it('resets refined content when tasks change', () => {
    const { rerender } = render(<AssemblyView project={projectWithCompletedTasks} />)

    // Simuler un contenu raffiné existant
    mockApiClient.runFinishingCrew.mockResolvedValue('Contenu raffiné')
    const refineButton = screen.getByText('Lancer le Raffinage IA')
    fireEvent.click(refineButton)

    // Changer les tâches du projet
    const newProject = {
      ...projectWithCompletedTasks,
      tasks: [completedTasks[0]] // Seulement une tâche maintenant
    }

    rerender(<AssemblyView project={newProject} />)

    // Le contenu raffiné devrait être réinitialisé
    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent.value).not.toBe('Contenu raffiné')
    expect(editorContent.value).toContain('<h2>Introduction</h2>')
  })

  it('allows reordering tasks in left panel', () => {
    render(<AssemblyView project={projectWithCompletedTasks} />)

    // Vérifier que les boutons de réorganisation sont présents
    expect(screen.getAllByText('↑')).toHaveLength(2) // Pas de bouton up pour le premier
    expect(screen.getAllByText('↓')).toHaveLength(2) // Pas de bouton down pour le dernier
  })
})
