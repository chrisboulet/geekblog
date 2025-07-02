import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import * as api from '../api'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset axios create mock
    mockedAxios.create.mockReturnValue({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })
  })

  describe('Projects API', () => {
    it('getProjects calls correct endpoint', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Test Project' }] }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.getProjects()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects')
      expect(result).toEqual(mockResponse.data)
    })

    it('getProject calls correct endpoint with ID', async () => {
      const mockResponse = { data: { id: 1, name: 'Test Project' } }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.getProject(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('createProject sends correct data', async () => {
      const mockResponse = { data: { id: 1, name: 'New Project' } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const projectData = { name: 'New Project', description: 'Test description' }
      const result = await api.createProject(projectData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/projects', projectData)
      expect(result).toEqual(mockResponse.data)
    })

    it('updateProject sends correct data to correct endpoint', async () => {
      const mockResponse = { data: { id: 1, name: 'Updated Project' } }
      const mockAxiosInstance = {
        put: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const updateData = { name: 'Updated Project' }
      const result = await api.updateProject(1, updateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/projects/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('deleteProject calls correct endpoint', async () => {
      const mockResponse = { data: { id: 1, name: 'Deleted Project' } }
      const mockAxiosInstance = {
        delete: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.deleteProject(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/projects/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('planProject calls planning endpoint with goal', async () => {
      const mockResponse = { data: { id: 1, tasks: ['New task'] } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.planProject(1, 'Project goal')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/projects/1/plan',
        { project_goal: 'Project goal' }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('planProject calls planning endpoint without goal', async () => {
      const mockResponse = { data: { id: 1, tasks: [] } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.planProject(1)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/projects/1/plan', {})
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Tasks API', () => {
    it('getTasksByProject calls correct endpoint', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Test Task' }] }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.getTasksByProject(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks/project/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('getTask calls correct endpoint with ID', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Task' } }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.getTask(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('createTask sends correct data', async () => {
      const mockResponse = { data: { id: 1, title: 'New Task' } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const taskData = { title: 'New Task', project_id: 1 }
      const result = await api.createTask(taskData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks', taskData)
      expect(result).toEqual(mockResponse.data)
    })

    it('updateTask sends correct data to correct endpoint', async () => {
      const mockResponse = { data: { id: 1, title: 'Updated Task' } }
      const mockAxiosInstance = {
        put: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const updateData = { title: 'Updated Task' }
      const result = await api.updateTask(1, updateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/tasks/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('deleteTask calls correct endpoint', async () => {
      const mockResponse = { data: { id: 1, title: 'Deleted Task' } }
      const mockAxiosInstance = {
        delete: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.deleteTask(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/tasks/1')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('AI Agent API', () => {
    it('runAgentOnTask calls correct endpoint with researcher', async () => {
      const mockResponse = { data: { id: 1, status: 'Révision' } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.runAgentOnTask(1, 'researcher', 'context')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tasks/1/run-agent',
        { agent_type: 'researcher', context: 'context' }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('runAgentOnTask calls correct endpoint with writer', async () => {
      const mockResponse = { data: { id: 1, status: 'Révision' } }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const result = await api.runAgentOnTask(1, 'writer')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tasks/1/run-agent',
        { agent_type: 'writer', context: undefined }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('runFinishingCrew calls assemble endpoint', async () => {
      const mockResponse = { data: 'Refined article content' }
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue(mockResponse)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      const rawContent = 'Raw article content'
      const result = await api.runFinishingCrew(1, rawContent)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/projects/1/assemble',
        { raw_content: rawContent }
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Error Handling', () => {
    it('propagates API errors correctly', async () => {
      const mockError = new Error('Network Error')
      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(mockError)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      await expect(api.getProjects()).rejects.toThrow('Network Error')
    })

    it('handles 404 errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Project not found' }
        }
      }
      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(mockError)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      await expect(api.getProject(999)).rejects.toEqual(mockError)
    })

    it('handles validation errors', async () => {
      const mockError = {
        response: {
          status: 422,
          data: { detail: 'Validation error' }
        }
      }
      const mockAxiosInstance = {
        post: vi.fn().mockRejectedValue(mockError)
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      await expect(api.createProject({ name: '' })).rejects.toEqual(mockError)
    })
  })

  describe('Configuration', () => {
    it('uses correct base URL from environment', () => {
      // Vérifier que axios.create est appelé avec la bonne configuration
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.stringContaining('/api/v1'),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('handles string and number IDs correctly', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: {} })
      }
      mockedAxios.create.mockReturnValue(mockAxiosInstance)

      // Test avec number ID
      await api.getProject(1)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/1')

      // Test avec string ID
      await api.getProject('abc123')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/abc123')
    })
  })
})