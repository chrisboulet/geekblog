import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProjects, createProject } from '../lib/api';
import { Project, ProjectCreate } from '../types/api';
import NeuralBackground from '../components/neural/NeuralBackground';
import NavigationHeader from '../components/navigation/NavigationHeader';
import ProjectCreateModal from '../components/project/ProjectCreateModal';
import ProjectActionsMenu from '../components/project/ProjectActionsMenu';

/**
 * Page listing all projects with navigation and creation options
 */
const ProjectListPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Handle action query parameter
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setIsCreating(true);
    }
  }, [searchParams]);

  // Fetch projects
  const { data: projects, isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (projectData: ProjectCreate) => createProject(projectData),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/project/${newProject.id}`);
    },
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    createProjectMutation.mutate({
      name: projectName,
      description: projectDescription || 'My new GeekBlog project',
    });
  };

  const handleQuickStart = () => {
    createProjectMutation.mutate({
      name: 'My First Blog Project',
      description: 'Getting started with GeekBlog - a content creation command center that combines human creativity with AI agents.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--bg-primary)' }}>
        <NeuralBackground />
        <div className="text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neural-purple"></div>
          <p className="mt-4 text-text-primary">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
        <NeuralBackground />
        <NavigationHeader />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <div className="neural-card p-6 neural-error">
            <p className="text-lg font-semibold mb-2">Error loading projects</p>
            <p className="text-sm mb-4">Please try again.</p>
            <button
              onClick={() => refetch()}
              className="neural-button neural-interactive neural-clickable neural-focusable"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No projects - redirect to welcome page
  if (projects && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
        <NeuralBackground />
        <NavigationHeader />
        <div className="flex-grow flex items-center justify-center relative z-10 px-4">
          <div className="max-w-lg w-full text-center">
            <div className="neural-card p-8">
              <h1 className="text-2xl font-bold mb-4 neural-text-gradient">
                Welcome to GeekBlog
              </h1>
              <p className="text-text-secondary mb-6">
                Create your first project to get started with AI-powered content creation.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full neural-button-primary neural-interactive neural-clickable neural-focusable"
                >
                  ✨ New Project
                </button>
                <button
                  onClick={handleQuickStart}
                  className="w-full neural-button neural-interactive neural-clickable neural-focusable"
                >
                  🚀 Quick Start
                </button>
                <button
                  onClick={() => navigate('/projects/new/template')}
                  className="w-full neural-button neural-interactive neural-clickable neural-focusable"
                >
                  ⚙️ Écrire un billet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
      <NeuralBackground />
      <NavigationHeader />

      <main className="flex-grow relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="neural-text-gradient">Your Projects</span>
              </h1>
              <p className="text-text-secondary">
                Manage your content creation projects and AI workflows
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="neural-button-primary neural-interactive neural-clickable neural-focusable"
              >
                ✨ New Project
              </button>
              <button
                onClick={handleQuickStart}
                className="neural-button neural-interactive neural-clickable neural-focusable"
              >
                🚀 Quick Start
              </button>
              <button
                onClick={() => navigate('/projects/new/template')}
                className="neural-button neural-interactive neural-clickable neural-focusable"
              >
                ⚙️ Écrire un billet
              </button>
            </div>
          </div>

          {/* Create Project Form */}
          {isCreating && (
            <div className="mb-8">
              <div className="neural-card p-6">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">
                  Create New Project
                </h2>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-text-primary mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., Tech Blog 2024"
                      required
                      className="w-full px-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple focus:border-neural-purple neural-focusable transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-text-primary mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Brief project description..."
                      className="w-full px-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple focus:border-neural-purple neural-focusable transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={createProjectMutation.isPending || !projectName.trim()}
                      className="neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
                    >
                      {createProjectMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating...
                        </span>
                      ) : (
                        '✨ Create Project'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setProjectName('');
                        setProjectDescription('');
                      }}
                      className="neural-button neural-interactive neural-clickable neural-focusable"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {createProjectMutation.isError && (
                  <div className="mt-4 p-4 neural-error rounded-lg">
                    <p>Failed to create project. Please try again.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="neural-card neural-interactive neural-clickable p-6 cursor-pointer relative group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
                      ID: {project.id}
                    </span>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ProjectActionsMenu project={project} />
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-text-tertiary">
                  <span>
                    {project.tasks?.length || 0} tasks
                  </span>
                  <span className="neural-text-gradient">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

    </div>
  );
};

export default ProjectListPage;
