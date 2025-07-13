import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isVisible,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps: OnboardingStep[] = [
    {
      title: "Bienvenue dans Neural Flow",
      description: "Créez et organisez vos idées de manière visuelle et intuitive. Laissez-nous vous guider !",
      position: "center"
    },
    {
      title: "Navigation Simple",
      description: "Utilisez cette barre de navigation pour vous déplacer facilement entre les projets et les vues.",
      target: ".navigation-header",
      position: "bottom"
    },
    {
      title: "Modes de Vue",
      description: "Basculez entre le mode Simple (idéal pour débuter) et Expert (fonctionnalités avancées).",
      target: ".view-switcher",
      position: "bottom"
    },
    {
      title: "Éditeur Central",
      description: "Commencez à écrire vos idées ici. L'interface s'adapte automatiquement à votre contenu.",
      target: ".floating-editor",
      position: "top"
    },
    {
      title: "Nœuds Neuraux",
      description: "Ces nœuds représentent vos idées. Cliquez pour les activer, double-cliquez pour les modifier.",
      target: ".neural-node",
      position: "right"
    },
    {
      title: "Vous êtes prêt !",
      description: "Explorez l'interface à votre rythme. L'aide contextuelle est toujours disponible.",
      position: "center",
      action: {
        label: "Commencer",
        onClick: () => onComplete()
      }
    }
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isVisible) return;

    const highlightTarget = () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('onboarding-highlight');
      }

      if (currentStepData.target) {
        const element = document.querySelector(currentStepData.target) as HTMLElement;
        if (element) {
          element.classList.add('onboarding-highlight');
          setHighlightedElement(element);

          // Scroll to element if needed
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      } else {
        setHighlightedElement(null);
      }
    };

    // Small delay to ensure elements are rendered
    const timer = setTimeout(highlightTarget, 100);
    return () => clearTimeout(timer);
  }, [currentStep, isVisible, currentStepData.target]);

  useEffect(() => {
    return () => {
      // Cleanup highlight on unmount
      if (highlightedElement) {
        highlightedElement.classList.remove('onboarding-highlight');
      }
    };
  }, [highlightedElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = (): React.CSSProperties => {
    if (currentStepData.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      };
    }

    // For targeted tooltips, we'll position them dynamically
    // This is a simplified version - in production you'd calculate based on target element
    return {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    };
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div className="onboarding-overlay">
        {/* Tooltip */}
        <div
          className="onboarding-tooltip"
          style={getTooltipPosition()}
        >
          <div className="tooltip-header">
            <h3 className="tooltip-title">{currentStepData.title}</h3>
            <div className="step-indicator">
              {currentStep + 1} / {steps.length}
            </div>
          </div>

          <p className="tooltip-description">
            {currentStepData.description}
          </p>

          <div className="tooltip-actions">
            <button
              onClick={onSkip}
              className="skip-btn"
              title="Ignorer le tutoriel"
            >
              Ignorer
            </button>

            <div className="navigation-buttons">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="nav-btn secondary"
                >
                  Précédent
                </button>
              )}

              {currentStepData.action ? (
                <button
                  onClick={currentStepData.action.onClick}
                  className="nav-btn primary"
                >
                  {currentStepData.action.label}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="nav-btn primary"
                >
                  {currentStep < steps.length - 1 ? 'Suivant' : 'Terminer'}
                </button>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="progress-dots">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                title={`Étape ${index + 1}: ${steps[index].title}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 5, 5, 0.8);
          backdrop-filter: blur(4px);
          z-index: 999;
          pointer-events: auto;
        }

        .onboarding-tooltip {
          background: var(--bg-glass-heavy);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          min-width: 320px;
          box-shadow: var(--neural-glow-lg);
          backdrop-filter: blur(20px);
        }

        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .tooltip-title {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--neural-purple), var(--neural-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .step-indicator {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .tooltip-description {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .tooltip-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .skip-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.2s ease;
        }

        .skip-btn:hover {
          color: var(--text-secondary);
        }

        .navigation-buttons {
          display: flex;
          gap: 8px;
        }

        .nav-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .nav-btn.secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .nav-btn.secondary:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
        }

        .nav-btn.primary {
          background: linear-gradient(135deg, var(--neural-purple), var(--neural-pink));
          color: white;
          box-shadow: var(--neural-glow-sm);
        }

        .nav-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: var(--neural-glow-md);
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.4;
        }

        .progress-dot:hover {
          opacity: 0.7;
          transform: scale(1.2);
        }

        .progress-dot.active {
          background: var(--neural-blue);
          opacity: 1;
          transform: scale(1.3);
        }

        .progress-dot.completed {
          background: var(--neural-purple);
          opacity: 0.8;
        }

        /* Global highlight style */
        :global(.onboarding-highlight) {
          position: relative;
          z-index: 1001;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.4), var(--neural-glow-lg);
          border-radius: 8px;
          animation: onboardingPulse 2s infinite;
        }

        @keyframes onboardingPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.4), var(--neural-glow-lg);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.6), var(--neural-glow-lg);
          }
        }

        @media (max-width: 768px) {
          .onboarding-tooltip {
            margin: 20px;
            max-width: calc(100vw - 40px);
            min-width: auto;
          }

          .tooltip-header {
            flex-direction: column;
            gap: 8px;
          }

          .tooltip-actions {
            flex-direction: column;
            gap: 12px;
          }

          .navigation-buttons {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingOverlay;
