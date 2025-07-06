import React, { useEffect, useRef } from 'react';

const NEURAL_CONFIG = {
  lines: {
    count: 20,
    minWidth: 100,
    maxWidth: 400,
    animationDuration: '3s',
    opacity: 0.3
  },
  particles: {
    count: 30,
    size: 4,
    animationDuration: '10s',
    travelDistance: 200
  }
};

const NeuralBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bg = backgroundRef.current;
    if (!bg) return;

    // Clear any existing children
    bg.innerHTML = '';

    // Create neural lines
    for (let i = 0; i < NEURAL_CONFIG.lines.count; i++) {
      const line = document.createElement('div');
      line.className = 'neural-line';
      
      const width = Math.random() * (NEURAL_CONFIG.lines.maxWidth - NEURAL_CONFIG.lines.minWidth) + NEURAL_CONFIG.lines.minWidth;
      line.style.width = width + 'px';
      line.style.left = Math.random() * 100 + '%';
      line.style.top = Math.random() * 100 + '%';
      line.style.transform = `rotate(${Math.random() * 360}deg)`;
      line.style.animationDelay = Math.random() * 3 + 's';
      
      bg.appendChild(line);
    }

    // Create floating particles
    for (let i = 0; i < NEURAL_CONFIG.particles.count; i++) {
      const particle = document.createElement('div');
      particle.className = 'neural-particle';
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Set random travel direction
      const tx = (Math.random() - 0.5) * NEURAL_CONFIG.particles.travelDistance;
      const ty = (Math.random() - 0.5) * NEURAL_CONFIG.particles.travelDistance;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      
      particle.style.animationDelay = Math.random() * 10 + 's';
      
      bg.appendChild(particle);
    }

    // Cleanup function
    return () => {
      if (bg) {
        bg.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={backgroundRef}
      className="neural-bg"
      aria-hidden="true"
    />
  );
};

export default NeuralBackground;