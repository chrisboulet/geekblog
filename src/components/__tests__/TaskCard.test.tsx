import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render, mockTask } from '../../test/test-utils'
import TaskCard from '../kanban/TaskCard'
import * as api from '../../lib/api'

// Mock du module API
vi.mock('../../lib/api', () => ({
  runAgentOnTask: vi.fn(),
  AgentType: {
    researcher: 'researcher',
    writer: 'writer'
  }
}))

const mockApiClient = api as any

describe('TaskCard', () => {
  const defaultProps = {
    task: mockTask,
    projectId: 1
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test task description')).toBeInTheDocument()
    expect(screen.getByText('À faire')).toBeInTheDocument()
  })

  it('displays task status with correct styling', () => {
    const todoTask = { ...mockTask, status: 'À faire' }
    render(<TaskCard task={todoTask} projectId={1} />)

    const statusElement = screen.getByText('À faire')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('shows different styling for different statuses', () => {
    const { rerender } = render(<TaskCard task={{ ...mockTask, status: 'En cours' }} projectId={1} />)
    expect(screen.getByText('En cours')).toHaveClass('bg-blue-100', 'text-blue-800')

    rerender(<TaskCard task={{ ...mockTask, status: 'Terminé' }} projectId={1} />)
    expect(screen.getByText('Terminé')).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('opens dropdown menu when more options button is clicked', async () => {
    render(<TaskCard {...defaultProps} />)

    const moreButton = screen.getByRole('button', { name: /more options/i })
    fireEvent.click(moreButton)

    await waitFor(() => {
      expect(screen.getByText('Déléguer au Chercheur')).toBeInTheDocument()
      expect(screen.getByText('Déléguer au Rédacteur')).toBeInTheDocument()
    })
  })

  it('calls researcher agent when "Déléguer au Chercheur" is clicked', async () => {
    mockApiClient.runAgentOnTask.mockResolvedValue({
      ...mockTask,
      status: 'Révision',
      description: 'Updated by researcher'
    })

    render(<TaskCard {...defaultProps} />)

    // Ouvrir le menu
    const moreButton = screen.getByRole('button', { name: /more options/i })
    fireEvent.click(moreButton)

    // Cliquer sur déléguer au chercheur
    await waitFor(() => {
      const researcherOption = screen.getByText('Déléguer au Chercheur')
      fireEvent.click(researcherOption)
    })

    expect(mockApiClient.runAgentOnTask).toHaveBeenCalledWith(
      mockTask.id,
      'researcher',
      undefined // Pas de contexte pour le chercheur
    )
  })

  it('calls writer agent with task description as context', async () => {
    mockApiClient.runAgentOnTask.mockResolvedValue({
      ...mockTask,
      status: 'Révision',
      description: 'Updated by writer'
    })

    render(<TaskCard {...defaultProps} />)

    // Ouvrir le menu
    const moreButton = screen.getByRole('button', { name: /more options/i })
    fireEvent.click(moreButton)

    // Cliquer sur déléguer au rédacteur
    await waitFor(() => {
      const writerOption = screen.getByText('Déléguer au Rédacteur')
      fireEvent.click(writerOption)
    })

    expect(mockApiClient.runAgentOnTask).toHaveBeenCalledWith(
      mockTask.id,
      'writer',
      mockTask.description // Description comme contexte pour le rédacteur
    )
  })

  it('shows loading state during agent execution', async () => {
    // Mock d'une promesse qui ne se résout pas immédiatement
    let resolvePromise: (value: any) => void
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockApiClient.runAgentOnTask.mockReturnValue(pendingPromise)

    render(<TaskCard {...defaultProps} />)

    // Déclencher l'action
    const moreButton = screen.getByRole('button', { name: /more options/i })
    fireEvent.click(moreButton)

    await waitFor(() => {
      const researcherOption = screen.getByText('Déléguer au Chercheur')
      fireEvent.click(researcherOption)
    })

    // Vérifier l'état de chargement
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    // Résoudre la promesse
    resolvePromise!({ ...mockTask, status: 'Révision' })

    // Vérifier que le loading disparaît
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApiClient.runAgentOnTask.mockRejectedValue(new Error('API Error'))

    render(<TaskCard {...defaultProps} />)

    // Déclencher l'action
    const moreButton = screen.getByRole('button', { name: /more options/i })
    fireEvent.click(moreButton)

    await waitFor(() => {
      const researcherOption = screen.getByText('Déléguer au Chercheur')
      fireEvent.click(researcherOption)
    })

    // Vérifier que l'erreur est loggée
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de l\'exécution de l\'agent'),
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('truncates long task descriptions', () => {
    const longDescriptionTask = {
      ...mockTask,
      description: 'Very long description that should be truncated because it exceeds the maximum length allowed for display in the task card component'
    }

    render(<TaskCard task={longDescriptionTask} projectId={1} />)

    const description = screen.getByText(/Very long description/)
    expect(description).toBeInTheDocument()
    // Vérifier que la description est tronquée (CSS truncate)
    expect(description).toHaveClass('line-clamp-2')
  })

  it('applies correct CSS classes for draggable behavior', () => {
    render(<TaskCard {...defaultProps} />)

    const taskCard = screen.getByRole('article') // Ou le sélecteur approprié
    expect(taskCard).toHaveClass('cursor-grab')
    expect(taskCard).toHaveClass('hover:border-neural-blue')
  })

  it('renders task without description gracefully', () => {
    const taskWithoutDescription = {
      ...mockTask,
      description: ''
    }

    render(<TaskCard task={taskWithoutDescription} projectId={1} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('À faire')).toBeInTheDocument()
    // La description vide ne doit pas causer d'erreur
  })
})
