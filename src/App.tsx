import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import ProjectListPage from './pages/ProjectListPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import RootRedirector from './pages/RootRedirector';
import NoProjectsPage from './pages/NoProjectsPage';
import HomePage from './components/home/HomePage';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirector />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new/template" element={<TemplateSelectionPage />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
          <Route path="/welcome" element={<NoProjectsPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
