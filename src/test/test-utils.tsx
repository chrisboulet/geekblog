import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Configuration du QueryClient pour les tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Provider wrapper pour les tests
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Render customisé avec les providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helpers pour mocker les données API
export const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test project description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tasks: []
}

export const mockTask = {
  id: 1,
  project_id: 1,
  title: 'Test Task',
  description: 'Test task description',
  status: 'À faire',
  order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const mockTasks = [
  { ...mockTask, id: 1, title: 'Task 1', status: 'À faire' },
  { ...mockTask, id: 2, title: 'Task 2', status: 'En cours' },
  { ...mockTask, id: 3, title: 'Task 3', status: 'Révision' },
  { ...mockTask, id: 4, title: 'Task 4', status: 'Terminé' },
]

// Helper pour créer un mock de API client
export const createMockApiClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
})

// Helper pour attendre les queries React Query
export const waitForQuery = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}
