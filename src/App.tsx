import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import ParticleBackground from './components/ui/ParticleBackground';

function App() {
  return (
    <Router>
      <div className="bg-bg-primary min-h-screen flex flex-col relative z-0">
        <ParticleBackground />
        <main className="flex-grow flex flex-col z-10">
          <Routes>
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/" element={<Navigate to="/project/1" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
