import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render, mockProject, mockTasks } from '../../test/test-utils'
import KanbanBoard from '../kanban/KanbanBoard'

// Mock du composant TaskCard pour simplifier les tests
vi.mock('../kanban/TaskCard', () => ({
  default: ({ task }: { task: any }) => (
    <div data-testid={`task-card-${task.id}`}>
      <h3>{task.title}</h3>
      <p>{task.status}</p>
    </div>
  )
}))

describe('KanbanBoard', () => {
  const projectWithTasks = {
    ...mockProject,
    tasks: mockTasks
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all kanban columns', () => {
    render(<KanbanBoard project={projectWithTasks} />)

    expect(screen.getByText('À faire')).toBeInTheDocument()
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Révision')).toBeInTheDocument()
    expect(screen.getByText('Terminé')).toBeInTheDocument()
  })

  it('distributes tasks correctly by status', () => {
    render(<KanbanBoard project={projectWithTasks} />)

    // Vérifier que chaque tâche est dans la bonne colonne
    const todoColumn = screen.getByTestId('kanban-column-À faire')
    const inProgressColumn = screen.getByTestId('kanban-column-En cours')
    const reviewColumn = screen.getByTestId('kanban-column-Révision')
    const doneColumn = screen.getByTestId('kanban-column-Terminé')

    expect(within(todoColumn).getByText('Task 1')).toBeInTheDocument()
    expect(within(inProgressColumn).getByText('Task 2')).toBeInTheDocument()
    expect(within(reviewColumn).getByText('Task 3')).toBeInTheDocument()
    expect(within(doneColumn).getByText('Task 4')).toBeInTheDocument()
  })

  it('handles empty project gracefully', () => {
    const emptyProject = { ...mockProject, tasks: [] }
    render(<KanbanBoard project={emptyProject} />)

    // Toutes les colonnes doivent être présentes mais vides
    expect(screen.getByText('À faire')).toBeInTheDocument()
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Révision')).toBeInTheDocument()
    expect(screen.getByText('Terminé')).toBeInTheDocument()

    // Aucune tâche ne doit être affichée
    expect(screen.queryByTestId(/task-card/)).not.toBeInTheDocument()
  })

  it('handles tasks with undefined status by placing them in "À faire"', () => {
    const tasksWithUndefinedStatus = [
      { ...mockTasks[0], status: undefined },
      { ...mockTasks[1], status: '' }
    ]
    const projectWithUndefinedStatus = {
      ...mockProject,
      tasks: tasksWithUndefinedStatus
    }

    render(<KanbanBoard project={projectWithUndefinedStatus} />)

    const todoColumn = screen.getByTestId('kanban-column-À faire')
    expect(within(todoColumn).getByText('Task 1')).toBeInTheDocument()
    expect(within(todoColumn).getByText('Task 2')).toBeInTheDocument()
  })

  it('sorts tasks by order within each column', () => {
    const unorderedTasks = [
      { ...mockTasks[0], order: 3, status: 'À faire' },
      { ...mockTasks[1], order: 1, status: 'À faire' },
      { ...mockTasks[2], order: 2, status: 'À faire' }
    ]
    const projectWithUnorderedTasks = {
      ...mockProject,
      tasks: unorderedTasks
    }

    render(<KanbanBoard project={projectWithUnorderedTasks} />)

    const todoColumn = screen.getByTestId('kanban-column-À faire')
    const tasks = within(todoColumn).getAllByTestId(/task-card/)

    // Vérifier l'ordre: Task 2 (order: 1), Task 3 (order: 2), Task 1 (order: 3)
    expect(tasks[0]).toHaveAttribute('data-testid', 'task-card-2')
    expect(tasks[1]).toHaveAttribute('data-testid', 'task-card-3')
    expect(tasks[2]).toHaveAttribute('data-testid', 'task-card-1')
  })

  it('handles tasks with unknown status by logging warning', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const tasksWithUnknownStatus = [
      { ...mockTasks[0], status: 'Status Inexistant' }
    ]
    const projectWithUnknownStatus = {
      ...mockProject,
      tasks: tasksWithUnknownStatus
    }

    render(<KanbanBoard project={projectWithUnknownStatus} />)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('statut inconnu: Status Inexistant')
    )

    consoleWarnSpy.mockRestore()
  })

  it('renders correct number of tasks in each column', () => {
    render(<KanbanBoard project={projectWithTasks} />)

    const todoColumn = screen.getByTestId('kanban-column-À faire')
    const inProgressColumn = screen.getByTestId('kanban-column-En cours')
    const reviewColumn = screen.getByTestId('kanban-column-Révision')
    const doneColumn = screen.getByTestId('kanban-column-Terminé')

    expect(within(todoColumn).getAllByTestId(/task-card/)).toHaveLength(1)
    expect(within(inProgressColumn).getAllByTestId(/task-card/)).toHaveLength(1)
    expect(within(reviewColumn).getAllByTestId(/task-card/)).toHaveLength(1)
    expect(within(doneColumn).getAllByTestId(/task-card/)).toHaveLength(1)
  })

  it('passes correct props to TaskCard components', () => {
    render(<KanbanBoard project={projectWithTasks} />)

    const taskCard = screen.getByTestId('task-card-1')
    expect(taskCard).toBeInTheDocument()
    expect(within(taskCard).getByText('Task 1')).toBeInTheDocument()
    expect(within(taskCard).getByText('À faire')).toBeInTheDocument()
  })

  it('updates when project prop changes', () => {
    const { rerender } = render(<KanbanBoard project={projectWithTasks} />)

    // Initialement 4 tâches
    expect(screen.getAllByTestId(/task-card/)).toHaveLength(4)

    // Nouveau projet avec seulement 2 tâches
    const newProject = {
      ...mockProject,
      tasks: [mockTasks[0], mockTasks[1]]
    }

    rerender(<KanbanBoard project={newProject} />)

    // Maintenant seulement 2 tâches
    expect(screen.getAllByTestId(/task-card/)).toHaveLength(2)
  })

  it('handles tasks without description gracefully', () => {
    const tasksWithoutDescription = [
      { ...mockTasks[0], description: null },
      { ...mockTasks[1], description: undefined }
    ]
    const projectWithoutDescription = {
      ...mockProject,
      tasks: tasksWithoutDescription
    }

    render(<KanbanBoard project={projectWithoutDescription} />)

    // Doit rendre sans erreur
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument()
  })

  it('shows correct task count per column in headers', () => {
    render(<KanbanBoard project={projectWithTasks} />)

    // Vérifier que les en-têtes de colonnes montrent le bon nombre de tâches
    expect(screen.getByText(/À faire.*\(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/En cours.*\(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/Révision.*\(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/Terminé.*\(1\)/)).toBeInTheDocument()
  })
})
