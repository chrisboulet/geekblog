import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/components/HomePage.module.css';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string;
  features: string[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      title: 'PLANIFICATION',
      description: 'Définissez vos objectifs et votre audience cible',
      icon: '🎯',
      details: 'Définissez clairement vos objectifs, votre audience et le message clé de votre contenu.',
      features: ['Assistant IA pour brainstorming', 'Templates prédéfinis', 'Analyse d\'audience']
    },
    {
      id: 2,
      title: 'RECHERCHE',
      description: 'L\'IA collecte les informations pertinentes',
      icon: '🔍',
      details: 'Notre IA recherche et compile automatiquement les informations les plus pertinentes.',
      features: ['Recherche web automatisée', 'Vérification des sources', 'Synthèse intelligente']
    },
    {
      id: 3,
      title: 'ÉCRITURE',
      description: 'L\'IA rédige le contenu de base pour vous',
      icon: '✍️',
      details: 'Génération automatique du premier draft basé sur vos objectifs et recherches.',
      features: ['Rédaction IA avancée', 'Adaptation du style', 'Structure optimisée']
    },
    {
      id: 4,
      title: 'ASSEMBLAGE',
      description: 'Organisez et peaufinez votre article',
      icon: '🔧',
      details: 'Interface intuitive pour réorganiser, éditer et personnaliser votre contenu.',
      features: ['Éditeur drag & drop', 'Révision collaborative', 'Prévisualisation temps réel']
    },
    {
      id: 5,
      title: 'FINALISATION',
      description: 'Publiez votre contenu optimisé',
      icon: '🚀',
      details: 'Optimisation SEO, mise en forme finale et publication multi-plateforme.',
      features: ['Optimisation SEO', 'Export multi-format', 'Planification publication']
    }
  ];

  const handleUserAction = (action: 'create' | 'view' | 'templates') => {
    switch(action) {
      case 'create':
        navigate('/projects/create');
        break;
      case 'view':
        navigate('/projects');
        break;
      case 'templates':
        navigate('/templates');
        break;
      default:
        console.warn(`Invalid action: ${action}`);
        navigate('/projects');
    }
  };

  return (
    <div className={styles.homeContainer}>

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
            <h2 className={`${styles.heroTitle} text-2xl md:text-3xl font-semibold mb-6`}>
              Votre Assistant de Création de Contenu
            </h2>

            <p className={`${styles.heroDescription} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
              Transformez vos idées en articles de qualité grâce à l'intelligence artificielle.
              Une plateforme qui combine créativité humaine et IA pour créer du contenu exceptionnel.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => handleUserAction('create')}
                className="neural-button-primary text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105"
                aria-label="Créer un nouveau projet"
              >
                🚀 Créer un Nouveau Projet
              </button>

              <button
                onClick={() => handleUserAction('view')}
                className="neural-button text-lg px-8 py-4 rounded-xl font-semibold"
                aria-label="Voir mes projets existants"
              >
                📁 Voir Mes Projets
              </button>

              <button
                onClick={() => handleUserAction('templates')}
                className={`${styles.templateButton} neural-button text-lg px-8 py-4 rounded-xl font-semibold border-neural-cyan`}
                aria-label="Explorer les templates disponibles"
              >
                📋 Explorer les Templates
              </button>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">

            {/* Section Title */}
            <div className="text-center mb-12">
              <h3 className={`${styles.sectionTitle} text-3xl md:text-4xl font-bold mb-4`}>
                Comment ça fonctionne ?
              </h3>
              <p className={`${styles.sectionDescription} text-lg`}>
                Un processus simple en 5 étapes pour créer du contenu de qualité
              </p>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="relative">

                  {/* Step Card */}
                  <div
                    className={`neural-card p-6 text-center neural-interactive cursor-pointer transition-all duration-300 ${styles.workflowCard} ${
                      selectedStep === step.id ? 'border-neural-purple bg-opacity-20 ' + styles.expanded : ''
                    }`}
                    onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  >

                    {/* Step Number */}
                    <div className={styles.stepNumber}>
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
                    <p className={`${styles.stepDescription} text-sm mb-4`}>
                      {step.description}
                    </p>

                    {/* Expanded Details */}
                    {selectedStep === step.id && (
                      <div className="mt-4 pt-4 border-t border-neural-purple border-opacity-30 text-left">
                        <p className={`${styles.expandedDetails} text-sm mb-3`}>
                          {step.details}
                        </p>
                        <div className="space-y-1">
                          {step.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-xs">
                              <span className="text-neural-cyan mr-2">✓</span>
                              <span className={styles.featureText}>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Click indicator */}
                    <div className={`${styles.clickIndicator} mt-2 text-xs opacity-70`}>
                      {selectedStep === step.id ? '▲ Cliquez pour réduire' : '▼ Cliquez pour en savoir plus'}
                    </div>
                  </div>

                  {/* Arrow (hidden on mobile and last item) */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={styles.workflowArrow}
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
            <h3 className={`${styles.ctaTitle} text-2xl md:text-3xl font-bold mb-4`}>
              Prêt à créer du contenu exceptionnel ?
            </h3>
            <p className={`${styles.ctaDescription} text-lg mb-8`}>
              Rejoignez les créateurs qui utilisent l'IA pour amplifier leur créativité
            </p>

            <button
              onClick={() => handleUserAction('create')}
              className="neural-button-primary text-xl px-10 py-5 rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105"
              aria-label="Commencer à créer maintenant"
            >
              🚀 Commencer Maintenant
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
