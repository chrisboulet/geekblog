import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationHeaderProps {
  projectName?: string;
  projectId?: number;
  currentView?: 'neural' | 'assembly';
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

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Projects', onClick: handleBackToProjects, isActive: false }
    ];

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
    <nav className="navigation-header">
      <div className="nav-content">
        {/* Logo and Home */}
        <div className="nav-brand">
          <button
            onClick={handleBackToProjects}
            className="nav-home-btn neural-interactive neural-clickable neural-focusable"
            title="Retour aux projets"
          >
            <span className="brand-icon">🧠</span>
            <span className="brand-text">GeekBlog</span>
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="nav-breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="breadcrumb-separator">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
              )}
              <button
                onClick={crumb.onClick}
                disabled={!crumb.onClick}
                className={`breadcrumb-item ${crumb.isActive ? 'active' : ''} ${!crumb.onClick ? 'disabled' : 'neural-interactive neural-clickable neural-focusable'}`}
                title={crumb.onClick ? `Aller à ${crumb.label}` : undefined}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Project Info */}
        {projectId && (
          <div className="nav-project-info">
            <span className="project-id">ID: {projectId}</span>
          </div>
        )}
      </div>

      <style>{`
        .navigation-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid rgba(102, 126, 234, 0.2);
          padding: 0;
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(10px);
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          max-width: 100%;
        }

        .nav-brand {
          display: flex;
          align-items: center;
        }

        .nav-home-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 16px;
          font-weight: 600;
        }

        .nav-home-btn:hover {
          background: var(--bg-glass);
          color: var(--neural-blue);
          transform: translateY(-1px);
        }

        .brand-icon {
          font-size: 20px;
        }

        .brand-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--neural-purple), var(--neural-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
          max-width: 500px;
        }

        .breadcrumb-separator {
          color: var(--text-tertiary);
          margin: 0 4px;
          opacity: 0.6;
        }

        .breadcrumb-item {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .breadcrumb-item:hover:not(.disabled) {
          background: var(--bg-glass);
          color: var(--neural-blue);
        }

        .breadcrumb-item.active {
          color: var(--text-primary);
          font-weight: 600;
          background: var(--bg-glass-heavy);
        }

        .breadcrumb-item.disabled {
          cursor: default;
          opacity: 0.7;
        }

        .nav-project-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .project-id {
          font-size: 12px;
          color: var(--text-tertiary);
          padding: 4px 8px;
          background: var(--bg-glass);
          border-radius: 4px;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 8px 16px;
          }

          .nav-breadcrumbs {
            max-width: 200px;
          }

          .breadcrumb-item {
            font-size: 12px;
            padding: 4px 8px;
            max-width: 80px;
          }

          .brand-text {
            display: none;
          }

          .nav-project-info {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavigationHeader;