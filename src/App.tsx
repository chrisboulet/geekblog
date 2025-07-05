import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import RootRedirector from './pages/RootRedirector';
import NoProjectsPage from './pages/NoProjectsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirector />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/welcome" element={<NoProjectsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
