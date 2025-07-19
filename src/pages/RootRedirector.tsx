import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { getProjects } from '../lib/api';
import { Project } from '../types/api';
import NeuralBackground from '../components/neural/NeuralBackground';

/**
 * Component that intelligently redirects users based on available projects.
 * Shows loading state while fetching, redirects to first project if any exist,
 * or redirects to welcome page if no projects exist.
 */
export default function RootRedirector() {
  const { data: projects, isLoading, isSuccess, isError } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
    retry: 1,
  });

  // Show loading spinner while fetching projects
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

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--bg-primary)' }}>
        <NeuralBackground />
        <div className="text-center relative z-10">
          <div className="neural-card p-6 neural-error">
            <p className="text-lg font-semibold mb-2">Error loading application data</p>
            <p className="text-sm">Please refresh the page and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle successful fetch
  if (isSuccess) {
    if (projects && projects.length > 0) {
      // Redirect to projects list to let user choose
      return <Navigate to="/projects" replace />;
    } else {
      // No projects exist, redirect to welcome/onboarding page
      return <Navigate to="/welcome" replace />;
    }
  }

  // Fallback (should not reach here)
  return null;
}
