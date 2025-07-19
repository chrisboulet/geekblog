import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/components/NavigationHeader.module.css';

interface NavigationHeaderProps {
  projectName?: string;
  projectId?: number;
  currentView?: 'neural' | 'assembly' | 'tasks';
}

interface Breadcrumb {
  label: string;
  onClick?: () => void;
  isActive: boolean;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  projectName,
  projectId,
  currentView = 'neural'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [];

    // Show Home only when not on home page
    if (location.pathname !== '/') {
      breadcrumbs.push(
        { label: 'Accueil', onClick: handleBackToHome, isActive: false }
      );
    }

    // Show Projects when on project pages
    if (location.pathname.startsWith('/project') || (projectName ?? false)) {
      breadcrumbs.push(
        { label: 'Projets', onClick: handleBackToProjects, isActive: false }
      );
    }

    if (projectName && projectId) {
      breadcrumbs.push({
        label: projectName,
        onClick: handleBackToProject,
        isActive: false
      });

      const viewLabel = currentView === 'neural' ? 'Neural Flow' : 'Assemblage';
      breadcrumbs.push({
        label: viewLabel,
        onClick: undefined,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className={styles.navigationHeader}>
      <div className={styles.navContent}>
        {/* Logo and Home */}
        <div className={styles.navBrand}>
          <button
            onClick={handleBackToHome}
            className={`${styles.navHomeBtn} neural-interactive neural-clickable neural-focusable`}
            title="Retour à l'accueil"
          >
            <span className={styles.brandIcon}>🧠</span>
            <span className={styles.brandText}>GeekBlog</span>
          </button>
        </div>

        {/* Breadcrumbs */}
        <nav className={styles.navBreadcrumbs} aria-label="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className={styles.breadcrumbSeparator}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
              )}
              <button
                onClick={crumb.onClick}
                disabled={!crumb.onClick}
                className={`${styles.breadcrumbItem} ${crumb.isActive ? styles.active : ''} ${!crumb.onClick ? styles.disabled : 'neural-interactive neural-clickable neural-focusable'}`}
                title={crumb.onClick ? `Aller à ${crumb.label}` : undefined}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Project Info */}
        {projectId && (
          <div className={styles.navProjectInfo}>
            <span className={styles.projectId}>ID: {projectId}</span>
          </div>
        )}
      </div>

    </nav>
  );
};

export default NavigationHeader;
