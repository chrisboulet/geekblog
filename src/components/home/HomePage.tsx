import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      title: 'PLANIFICATION',
      description: 'Définissez vos objectifs et votre audience cible',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'RECHERCHE',
      description: 'L\'IA collecte les informations pertinentes',
      icon: '🔍'
    },
    {
      id: 3,
      title: 'ÉCRITURE',
      description: 'L\'IA rédige le contenu de base pour vous',
      icon: '✍️'
    },
    {
      id: 4,
      title: 'ASSEMBLAGE',
      description: 'Organisez et peaufinez votre article',
      icon: '🔧'
    },
    {
      id: 5,
      title: 'FINALISATION',
      description: 'Publiez votre contenu optimisé',
      icon: '🚀'
    }
  ];

  const handleStartCreating = () => {
    navigate('/projects');
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{ 
        background: 'var(--bg-primary, #050505)',
        color: 'var(--text-primary, #ffffff)'
      }}
    >
      
      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Brand Logo */}
            <div className="mb-8">
              <span className="text-6xl mb-4 block">🧠</span>
              <h1 className="neural-text-gradient text-5xl md:text-6xl font-bold mb-6">
                GeekBlog
              </h1>
            </div>

            {/* Hero Content */}
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-6"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              Votre Assistant de Création de Contenu
            </h2>
            
            <p 
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary, #a0a0a0)' }}
            >
              Transformez vos idées en articles de qualité grâce à l'intelligence artificielle. 
              Une plateforme qui combine créativité humaine et IA pour créer du contenu exceptionnel.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleStartCreating}
                className="neural-button-primary text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105"
              >
                Commencer Votre Premier Projet
              </button>
              
              <button
                onClick={handleStartCreating}
                className="neural-button text-lg px-8 py-4 rounded-xl font-semibold"
              >
                Voir Vos Projets
              </button>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Title */}
            <div className="text-center mb-12">
              <h3 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: 'var(--text-primary, #ffffff)' }}
              >
                Comment ça fonctionne ?
              </h3>
              <p 
                className="text-lg"
                style={{ color: 'var(--text-secondary, #a0a0a0)' }}
              >
                Un processus simple en 5 étapes pour créer du contenu de qualité
              </p>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  
                  {/* Step Card */}
                  <div className="neural-card p-6 text-center h-full neural-interactive">
                    
                    {/* Step Number */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg"
                      style={{ 
                        background: 'var(--gradient-neural, linear-gradient(135deg, #667eea, #764ba2))'
                      }}
                    >
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div className="text-4xl mb-4">
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-lg mb-3 neural-text-gradient">
                      {step.title}
                    </h4>

                    {/* Description */}
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary, #a0a0a0)' }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (hidden on mobile and last item) */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        style={{ color: 'var(--neural-purple, #667eea)' }}
                      >
                        <path 
                          d="M9 18l6-6-6-6" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              Prêt à créer du contenu exceptionnel ?
            </h3>
            <p 
              className="text-lg mb-8"
              style={{ color: 'var(--text-secondary, #a0a0a0)' }}
            >
              Rejoignez les créateurs qui utilisent l'IA pour amplifier leur créativité
            </p>
            
            <button
              onClick={handleStartCreating}
              className="neural-button-primary text-xl px-10 py-5 rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105"
            >
              Commencer Maintenant
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;