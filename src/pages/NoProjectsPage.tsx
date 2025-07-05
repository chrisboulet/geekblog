import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../lib/api';
import { ProjectCreate } from '../types/api';
import ParticleBackground from '../components/ui/ParticleBackground';

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
    <div className="bg-bg-primary min-h-screen flex flex-col relative z-0">
      <ParticleBackground />
      <main className="flex-grow flex items-center justify-center z-10 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Welcome to GeekBlog
            </h1>
            <p className="text-xl text-text-secondary mb-2">
              Your Content Creation Command Center
            </p>
            <p className="text-text-secondary">
              Combine human creativity with AI agents to streamline your blog post creation through a visual Kanban workflow.
            </p>
          </div>

          {!isCreating ? (
            <div className="text-center space-y-6">
              <div className="bg-bg-secondary/30 backdrop-blur-sm rounded-lg p-8 border border-accent-primary/20">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  Ready to get started?
                </h2>
                <p className="text-text-secondary mb-6">
                  Create your first project to begin organizing your content creation workflow.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={handleQuickStart}
                    disabled={createProjectMutation.isPending}
                    className="w-full bg-accent-primary hover:bg-accent-secondary text-bg-primary font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createProjectMutation.isPending ? 'Creating...' : 'Quick Start with Sample Project'}
                  </button>
                  
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-bg-primary font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Create Custom Project
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-secondary/30 backdrop-blur-sm rounded-lg p-8 border border-accent-primary/20">
              <h2 className="text-2xl font-semibold text-text-primary mb-6">
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
                    className="w-full px-4 py-2 bg-bg-primary border border-accent-primary/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-bg-primary border border-accent-primary/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 border border-text-secondary text-text-secondary hover:bg-text-secondary hover:text-bg-primary font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending || !projectName.trim()}
                    className="flex-1 bg-accent-primary hover:bg-accent-secondary text-bg-primary font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
              
              {createProjectMutation.isError && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-300">
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