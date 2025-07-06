import React from 'react';
import { Project } from '../../types/api';

interface ProjectStatusProps {
  project: Project;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ project }) => {
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  
  if (totalTasks === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-neural-purple animate-pulse"></div>
        <span className="text-text-secondary">Nouveau projet - Prêt pour la planification</span>
      </div>
    );
  }

  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status || 'À faire';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedTasks = statusCounts['Terminé'] || 0;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const getStatusColor = () => {
    if (progressPercentage === 100) return 'text-green-400';
    if (progressPercentage >= 50) return 'text-neural-blue';
    if (progressPercentage > 0) return 'text-neural-purple';
    return 'text-neural-pink';
  };

  const getStatusIcon = () => {
    if (progressPercentage === 100) return '✅';
    if (progressPercentage >= 50) return '🚀';
    if (progressPercentage > 0) return '⚡';
    return '🎯';
  };

  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <span className={`font-medium ${getStatusColor()}`}>
          {progressPercentage}% terminé
        </span>
      </div>
      
      <div className="flex items-center space-x-1 text-text-tertiary">
        <span>({completedTasks}/{totalTasks} tâches)</span>
      </div>

      <div className="w-24 bg-bg-secondary rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-neural-purple to-neural-blue transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} className="text-xs text-text-tertiary">
          {status}: {count}
        </div>
      ))}
    </div>
  );
};

export default ProjectStatus;