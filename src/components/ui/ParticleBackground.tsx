import React from 'react';

const ParticleBackground: React.FC = () => {
  // Générer un nombre aléatoire de particules pour varier l'effet
  const numParticles = Math.floor(Math.random() * 15) + 15; // Entre 15 et 30 particules

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {Array.from({ length: numParticles }).map((_, i) => {
        const size = Math.random() * 3 + 1; // Taille entre 1px et 4px
        const animationDuration = Math.random() * 20 + 15; // Durée entre 15s et 35s
        const animationDelay = Math.random() * 10; // Délai pour décaler les animations
        const xPos = Math.random() * 100; // Position X en %
        const yPos = Math.random() * 100; // Position Y en % initial
        const opacity = Math.random() * 0.3 + 0.1; // Opacité entre 0.1 et 0.4

        // Couleurs neurales pour les particules
        const colors = ['bg-neural-purple', 'bg-neural-pink', 'bg-neural-blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className={`absolute rounded-full ${color} animate-particle-float`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${xPos}%`,
              top: `${yPos}%`,
              opacity: opacity,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleBackground;
