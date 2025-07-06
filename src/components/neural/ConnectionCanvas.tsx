import React, { useRef, useEffect, useCallback } from 'react';

interface Node {
  id: string;
  type: 'idea' | 'category' | 'tag';
  position: { x: number; y: number };
  content: string;
  connections: string[];
}

interface ConnectionCanvasProps {
  nodes: Node[];
  activeNodeId: string | null;
}

const CONNECTION_CONFIG = {
  maxDistance: 300, // Max distance for auto-connections (pixels)
  curveIntensity: 50, // Curve intensity for bezier paths
  animationSpeed: 0.02,
  strengthThreshold: 0.3,
  gradientStops: [
    { offset: 0, opacity: 0.3 },
    { offset: 0.5, opacity: 0.6 },
    { offset: 1, opacity: 0.3 }
  ]
};

const ConnectionCanvas: React.FC<ConnectionCanvasProps> = ({ nodes, activeNodeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const calculateDistance = useCallback((pos1: { x: number; y: number }, pos2: { x: number; y: number }, canvasWidth: number, canvasHeight: number) => {
    const x1 = (pos1.x / 100) * canvasWidth;
    const y1 = (pos1.y / 100) * canvasHeight;
    const x2 = (pos2.x / 100) * canvasWidth;
    const y2 = (pos2.y / 100) * canvasHeight;
    
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }, []);

  const calculateConnectionStrength = useCallback((node1: Node, node2: Node, distance: number) => {
    // Base strength on distance (closer = stronger)
    let strength = 1 - (distance / CONNECTION_CONFIG.maxDistance);
    
    // Boost strength for explicit connections
    if (node1.connections.includes(node2.id) || node2.connections.includes(node1.id)) {
      strength += 0.5;
    }
    
    // Boost strength for related types
    if (node1.type === 'category' && node2.type === 'idea') {
      strength += 0.2;
    }
    
    // Boost strength for content similarity (simple keyword matching)
    const words1 = node1.content.toLowerCase().split(/\s+/);
    const words2 = node2.content.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 2);
    if (commonWords.length > 0) {
      strength += commonWords.length * 0.1;
    }
    
    return Math.min(strength, 1);
  }, []);

  const drawConnection = useCallback((
    ctx: CanvasRenderingContext2D,
    node1: Node,
    node2: Node,
    strength: number,
    canvasWidth: number,
    canvasHeight: number,
    time: number
  ) => {
    const x1 = (node1.position.x / 100) * canvasWidth;
    const y1 = (node1.position.y / 100) * canvasHeight;
    const x2 = (node2.position.x / 100) * canvasWidth;
    const y2 = (node2.position.y / 100) * canvasHeight;
    
    // Create gradient for the connection
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    
    // Color based on node types
    let color1 = 'rgba(102, 126, 234'; // neural-purple
    let color2 = 'rgba(118, 75, 162'; // neural-pink
    
    if (node1.type === 'category' || node2.type === 'category') {
      color2 = 'rgba(118, 75, 162'; // neural-pink
    }
    if (node1.type === 'tag' || node2.type === 'tag') {
      color1 = 'rgba(6, 182, 212'; // neural-cyan
    }
    
    // Animate opacity based on time
    const animatedOpacity = strength * (0.3 + 0.3 * Math.sin(time * CONNECTION_CONFIG.animationSpeed));
    
    gradient.addColorStop(0, `${color1}, ${animatedOpacity})`);
    gradient.addColorStop(0.5, `${color2}, ${animatedOpacity * 1.5})`);
    gradient.addColorStop(1, `${color1}, ${animatedOpacity})`);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(1, strength * 3);
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    // Create curved path
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const controlX = midX;
    const controlY = midY - CONNECTION_CONFIG.curveIntensity * strength;
    
    ctx.quadraticCurveTo(controlX, controlY, x2, y2);
    ctx.stroke();
    
    // Add flowing particles along the connection for strong connections
    if (strength > 0.7) {
      const particlePosition = (time * 0.005) % 1;
      const particleX = x1 + (x2 - x1) * particlePosition;
      const particleY = y1 + (y2 - y1) * particlePosition - CONNECTION_CONFIG.curveIntensity * strength * Math.sin(Math.PI * particlePosition);
      
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = `${color1}, 0.8)`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, []);

  const drawConnections = useCallback((time: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const distance = calculateDistance(node1.position, node2.position, width, height);
        
        if (distance < CONNECTION_CONFIG.maxDistance) {
          const strength = calculateConnectionStrength(node1, node2, distance);
          
          if (strength > CONNECTION_CONFIG.strengthThreshold) {
            // Highlight connections involving active node
            let adjustedStrength = strength;
            if (activeNodeId && (node1.id === activeNodeId || node2.id === activeNodeId)) {
              adjustedStrength = Math.min(strength * 1.5, 1);
            }
            
            drawConnection(ctx, node1, node2, adjustedStrength, width, height, time);
          }
        }
      }
    }
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(() => drawConnections(time + 1));
  }, [nodes, activeNodeId, calculateDistance, calculateConnectionStrength, drawConnection]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  // Initialize and handle resize
  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // Start animation
  useEffect(() => {
    drawConnections();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawConnections]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
};

export default ConnectionCanvas;