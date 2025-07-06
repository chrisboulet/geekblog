import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project, Task } from '../../types/api';
import FloatingEditor from './FloatingEditor';
import NeuralNode from './NeuralNode';
import ConnectionCanvas from './ConnectionCanvas';

interface NeuralCanvasProps {
  project: Project;
  isSimpleMode?: boolean;
  onSaveContent?: (content: string, title: string) => void;
  onCreateNode?: (type: 'idea' | 'category' | 'tag', position: { x: number; y: number }) => void;
}

const NeuralCanvas: React.FC<NeuralCanvasProps> = ({ 
  project,
  isSimpleMode = false,
  onSaveContent,
  onCreateNode 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState(project.name);
  const [nodes, setNodes] = useState<Array<{
    id: string;
    type: 'idea' | 'category' | 'tag';
    position: { x: number; y: number };
    content: string;
    connections: string[];
  }>>([]);

  // Initialize nodes from project tasks
  useEffect(() => {
    if (isSimpleMode) {
      // Simple mode: Only show essential nodes with clear positioning
      if (project.tasks && project.tasks.length > 0) {
        // Show maximum 3 nodes in simple mode
        const limitedTasks = project.tasks.slice(0, 3);
        const initialNodes = limitedTasks.map((task, index) => ({
          id: String(task.id),
          type: getNodeTypeFromTask(task),
          position: getSimplePosition(index),
          content: task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title,
          connections: []
        }));
        setNodes(initialNodes);
      } else {
        // Simple welcome nodes
        setNodes([
          {
            id: 'welcome',
            type: 'idea',
            position: { x: 25, y: 30 },
            content: 'Première idée',
            connections: []
          },
          {
            id: 'start',
            type: 'category',
            position: { x: 75, y: 30 },
            content: 'Commencer ici',
            connections: []
          }
        ]);
      }
    } else {
      // Expert mode: Show all nodes with complex positioning
      if (project.tasks && project.tasks.length > 0) {
        const initialNodes = project.tasks.map((task, index) => ({
          id: String(task.id),
          type: getNodeTypeFromTask(task),
          position: generateInitialPosition(index, project.tasks!.length),
          content: task.title,
          connections: []
        }));
        setNodes(initialNodes);
      } else {
        // Create some default nodes if no tasks
        setNodes([
          {
            id: 'welcome',
            type: 'idea',
            position: { x: 20, y: 20 },
            content: 'Bienvenue dans Neural Flow',
            connections: []
          },
          {
            id: 'start',
            type: 'category',
            position: { x: 70, y: 60 },
            content: 'Commencer ici',
            connections: ['welcome']
          }
        ]);
      }
    }
  }, [project.tasks, isSimpleMode]);

  const getSimplePosition = (index: number): { x: number; y: number } => {
    // Simple grid positioning for easy understanding
    const positions = [
      { x: 25, y: 30 }, // Top left
      { x: 75, y: 30 }, // Top right
      { x: 50, y: 65 }  // Bottom center
    ];
    return positions[index] || { x: 50, y: 50 };
  };

  const getNodeTypeFromTask = (task: Task): 'idea' | 'category' | 'tag' => {
    if (task.title.startsWith('#')) return 'tag';
    if (task.title.includes('catégorie') || task.title.includes('section')) return 'category';
    return 'idea';
  };

  const generateInitialPosition = (index: number, total: number): { x: number; y: number } => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 30; // Percentage from center
    const centerX = 50;
    const centerY = 50;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Don't create node if clicking on existing elements
    if ((e.target as HTMLElement).closest('.neural-node, .floating-editor')) {
      return;
    }
    
    if (onCreateNode) {
      onCreateNode('idea', { x, y });
    } else {
      // Create node locally
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'idea' as const,
        position: { x, y },
        content: 'Nouvelle idée',
        connections: []
      };
      setNodes(prev => [...prev, newNode]);
    }
  }, [onCreateNode]);

  const handleNodeMove = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  }, []);

  const handleNodeEdit = useCallback((nodeId: string, newContent: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, content: newContent }
        : node
    ));
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId);
    
    // Create neural pulse effect
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const pulse = document.createElement('div');
      pulse.className = 'neural-pulse';
      pulse.style.left = node.position.x + '%';
      pulse.style.top = node.position.y + '%';
      pulse.style.transform = 'translate(-50%, -50%)';
      
      canvasRef.current.appendChild(pulse);
      setTimeout(() => pulse.remove(), 3000);
    }
  }, [nodes]);

  const handleSave = useCallback(() => {
    if (onSaveContent) {
      onSaveContent(editorContent, editorTitle);
    }
  }, [editorContent, editorTitle, onSaveContent]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.05), transparent)'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Connection Canvas - Hidden in simple mode for clarity */}
      {!isSimpleMode && (
        <ConnectionCanvas nodes={nodes} activeNodeId={activeNodeId} />
      )}
      
      {/* Central Floating Editor */}
      <FloatingEditor
        title={editorTitle}
        content={editorContent}
        onTitleChange={setEditorTitle}
        onContentChange={setEditorContent}
        onSave={handleSave}
        projectName={project.name}
      />
      
      {/* Neural Nodes */}
      {nodes.map(node => (
        <NeuralNode
          key={node.id}
          id={node.id}
          type={node.type}
          position={node.position}
          content={node.content}
          isActive={activeNodeId === node.id}
          onMove={handleNodeMove}
          onEdit={handleNodeEdit}
          onClick={handleNodeClick}
        />
      ))}
      
      {/* Instructions overlay based on mode */}
      {isSimpleMode ? (
        <div className="absolute top-4 left-4 right-4 text-center">
          <div className="neural-card p-4 max-w-lg mx-auto">
            <h3 className="neural-text-gradient font-semibold text-base mb-2">
              Mode Simple - Neural Flow
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Interface simplifiée pour commencer facilement.
            </p>
            <div className="text-xs text-text-tertiary space-y-1">
              <p>• Écrivez dans l'éditeur central</p>
              <p>• Cliquez sur les nœuds pour les activer</p>
              <p>• Double-cliquez pour éditer les nœuds</p>
              <p>• Basculez en mode Expert pour plus de fonctionnalités</p>
            </div>
          </div>
        </div>
      ) : (
        nodes.length <= 2 && (
          <div className="absolute top-4 left-4 right-4 text-center">
            <div className="neural-card p-4 max-w-md mx-auto">
              <p className="text-sm text-text-secondary">
                <span className="neural-text-gradient font-semibold">Double-cliquez</span> pour créer un nouveau nœud neural
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                Commencez à écrire dans l'éditeur central pour voir les connexions se former automatiquement
              </p>
            </div>
          </div>
        )
      )}

      {/* Simple mode add node button */}
      {isSimpleMode && nodes.length < 3 && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => handleDoubleClick({ 
              clientX: 0, 
              clientY: 0, 
              target: canvasRef.current 
            } as any)}
            className="neural-button-primary neural-interactive neural-clickable neural-focusable flex items-center gap-2 px-4 py-2"
            title="Ajouter un nouveau nœud"
          >
            <span>+</span>
            <span>Ajouter une idée</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NeuralCanvas;