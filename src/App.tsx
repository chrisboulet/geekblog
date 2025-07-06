import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import ProjectListPage from './pages/ProjectListPage';
import RootRedirector from './pages/RootRedirector';
import NoProjectsPage from './pages/NoProjectsPage';
import HomePage from './components/home/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/welcome" element={<NoProjectsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
