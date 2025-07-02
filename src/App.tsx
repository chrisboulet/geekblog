import React from 'react';
import ProjectPage from './pages/ProjectPage'; // Importer la page de projet
import ParticleBackground from './components/ui/ParticleBackground'; // Importer l'arrière-plan animé

function App() {
  return (
    // La classe bg-bg-primary est appliquée ici pour que toute la page ait le fond défini
    // min-h-screen et flex flex-col sont utiles pour que ProjectPage puisse s'étendre
    <div className="bg-bg-primary min-h-screen flex flex-col relative z-0"> {/* Ajout de relative et z-0 pour le contexte de stacking */}
      <ParticleBackground />
      {/*
        Idéalement, il y aurait un composant Layout ici qui gérerait la navigation globale (sidebar, header global etc.)
        Pour l'instant, on affiche directement ProjectPage.
        Le contenu principal doit avoir un z-index supérieur si ParticleBackground en a un négatif, ou être positionné pour apparaître au-dessus.
      */}
      <main className="flex-grow flex flex-col z-10"> {/* z-10 pour être au-dessus du background */}
        <ProjectPage />
      </main>
    </div>
  );
}

export default App;
