import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../lib/api';
import { ProjectCreate } from '../types/api';
import NeuralBackground from '../components/neural/NeuralBackground';

/**
 * Welcome page shown when no projects exist.
 * Guides users to create their first project.
 */
export default function NoProjectsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: (projectData: ProjectCreate) => createProject(projectData),
    onSuccess: (newProject) => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Navigate to the newly created project
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

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
      <NeuralBackground />
      <main className="flex-grow flex items-center justify-center relative z-10 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              <span className="neural-text-gradient">Welcome to GeekBlog</span>
            </h1>
            <p className="text-xl text-text-secondary mb-2">
              Your Content Creation Command Center
            </p>
            <p className="text-text-secondary">
              Combine human creativity with AI agents to streamline your blog post creation through a visual Neural Flow interface.
            </p>
          </div>

          {!isCreating ? (
            <div className="text-center space-y-6">
              <div className="neural-card p-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Ready to get started?
                </h2>
                <p className="text-text-secondary mb-6">
                  Create your first project to begin organizing your content creation workflow with AI agents.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleQuickStart}
                    disabled={createProjectMutation.isPending}
                    className="w-full neural-button-primary neural-interactive neural-clickable neural-focusable"
                  >
                    {createProjectMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <>🚀 Quick Start with Sample Project</>
                    )}
                  </button>

                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full neural-button neural-interactive neural-clickable neural-focusable"
                  >
                    ⚙️ Create Custom Project
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="neural-card p-8">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Create Your Project
              </h2>

              <form onSubmit={handleCreateProject} className="space-y-4">
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
                  <textarea
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project goals and content strategy..."
                    rows={3}
                    className="w-full px-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple focus:border-neural-purple neural-focusable transition-all"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 neural-button neural-interactive neural-clickable neural-focusable"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending || !projectName.trim()}
                    className="flex-1 neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
                  >
                    {createProjectMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      '✨ Create Project'
                    )}
                  </button>
                </div>
              </form>

              {createProjectMutation.isError && (
                <div className="mt-4 p-4 neural-error rounded-lg">
                  <p>
                    Failed to create project. Please try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
