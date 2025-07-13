import React from 'react';

type ViewMode = 'neural' | 'assembly' | 'tasks';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isSimpleMode?: boolean;
  onToggleSimpleMode?: (simple: boolean) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  isSimpleMode = false,
  onToggleSimpleMode
}) => {
  const views = [
    {
      id: 'neural' as ViewMode,
      label: 'Neural Flow',
      icon: '🧠',
      description: 'Interface de création avec connexions visuelles'
    },
    {
      id: 'tasks' as ViewMode,
      label: 'Tâches',
      icon: '📋',
      description: 'Gestion complète des tâches du projet'
    },
    {
      id: 'assembly' as ViewMode,
      label: 'Assemblage',
      icon: '✨',
      description: 'Vue d\'assemblage et finalisation de contenu'
    }
  ];

  return (
    <div className="view-switcher">
      {/* View Mode Tabs */}
      <div className="view-tabs">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`view-tab neural-interactive neural-clickable neural-focusable ${currentView === view.id ? 'active' : ''}`}
            title={view.description}
          >
            <span className="view-icon">{view.icon}</span>
            <span className="view-label">{view.label}</span>
          </button>
        ))}
      </div>

      {/* Simple/Expert Mode Toggle (only for Neural Flow) */}
      {currentView === 'neural' && onToggleSimpleMode && (
        <div className="mode-toggle">
          <button
            onClick={() => onToggleSimpleMode(!isSimpleMode)}
            className={`toggle-btn neural-interactive neural-clickable neural-focusable ${isSimpleMode ? 'simple' : 'expert'}`}
            title={isSimpleMode ? 'Passer en mode expert' : 'Passer en mode simple'}
          >
            <span className="toggle-icon">
              {isSimpleMode ? '🎯' : '⚙️'}
            </span>
            <span className="toggle-label">
              {isSimpleMode ? 'Simple' : 'Expert'}
            </span>
          </button>
        </div>
      )}

      <style>{`
        .view-switcher {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-glass);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .view-tabs {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
        }

        .view-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          min-width: 120px;
          justify-content: center;
        }

        .view-tab:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .view-tab.active {
          background: linear-gradient(135deg, var(--neural-purple), var(--neural-pink));
          color: white;
          font-weight: 600;
          box-shadow: var(--neural-glow-sm);
        }

        .view-tab.active:hover {
          transform: translateY(-2px);
          box-shadow: var(--neural-glow-md);
        }

        .view-icon {
          font-size: 16px;
        }

        .view-label {
          font-size: 14px;
        }

        .mode-toggle {
          display: flex;
          align-items: center;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
        }

        .toggle-btn:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
          border-color: var(--neural-blue);
        }

        .toggle-btn.simple {
          background: linear-gradient(135deg, var(--neural-blue), var(--neural-cyan));
          color: white;
          border-color: var(--neural-blue);
        }

        .toggle-btn.expert {
          background: linear-gradient(135deg, var(--neural-purple), var(--neural-pink));
          color: white;
          border-color: var(--neural-purple);
        }

        .toggle-icon {
          font-size: 14px;
        }

        .toggle-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .view-switcher {
            flex-direction: column;
            gap: 8px;
            padding: 6px;
          }

          .view-tabs {
            width: 100%;
          }

          .view-tab {
            flex: 1;
            min-width: auto;
            padding: 6px 12px;
          }

          .view-label {
            display: none;
          }

          .mode-toggle {
            width: 100%;
            justify-content: center;
          }

          .toggle-btn {
            padding: 4px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewSwitcher;
