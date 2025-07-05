import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { getProjects } from '../lib/api';
import { Project } from '../types/api';

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
      <div className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
          <p className="mt-4 text-text-primary">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary">Error loading application data.</p>
          <p className="text-text-secondary mt-2">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  // Handle successful fetch
  if (isSuccess) {
    if (projects && projects.length > 0) {
      // Redirect to the first project in the list
      return <Navigate to={`/project/${projects[0].id}`} replace />;
    } else {
      // No projects exist, redirect to welcome/onboarding page
      return <Navigate to="/welcome" replace />;
    }
  }

  // Fallback (should not reach here)
  return null;
}