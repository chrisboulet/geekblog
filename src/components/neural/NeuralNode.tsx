import React, { useState, useRef, useCallback } from 'react';

interface NeuralNodeProps {
  id: string;
  type: 'idea' | 'category' | 'tag';
  position: { x: number; y: number }; // Percentage-based positioning
  content: string;
  isActive?: boolean;
  onMove: (id: string, newPosition: { x: number; y: number }) => void;
  onEdit: (id: string, newContent: string) => void;
  onClick: (id: string) => void;
}

const NeuralNode: React.FC<NeuralNodeProps> = ({
  id,
  type,
  position,
  content,
  isActive = false,
  onMove,
  onEdit,
  onClick
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'idea': return '💡';
      case 'category': return '📁';
      case 'tag': return '#️⃣';
      default: return '💡';
    }
  };

  const getNodeTypeClass = (nodeType: string) => {
    return `node-type-${nodeType}`;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);

    if (nodeRef.current) {
      const rect = nodeRef.current.parentElement!.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left - (position.x / 100) * rect.width,
        y: e.clientY - rect.top - (position.y / 100) * rect.height
      };
    }
  }, [isEditing, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !nodeRef.current) return;

    e.preventDefault();

    const parentRect = nodeRef.current.parentElement!.getBoundingClientRect();
    const newX = ((e.clientX - parentRect.left - dragStartRef.current.x) / parentRect.width) * 100;
    const newY = ((e.clientY - parentRect.top - dragStartRef.current.y) / parentRect.height) * 100;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(100, newX));
    const constrainedY = Math.max(0, Math.min(100, newY));

    onMove(id, { x: constrainedX, y: constrainedY });
  }, [isDragging, id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Add global event listeners for drag
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isEditing) {
      onClick(id);
    }
  }, [isDragging, isEditing, onClick, id]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(content);
  }, [content]);

  const handleEditSubmit = useCallback(() => {
    if (editContent.trim() !== content) {
      onEdit(id, editContent.trim());
    }
    setIsEditing(false);
  }, [editContent, content, onEdit, id]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(content);
    }
  }, [handleEditSubmit, content]);

  const nodeClasses = `
    neural-node neural-draggable neural-interactive neural-focusable
    ${getNodeTypeClass(type)}
    ${isActive ? 'active' : ''}
    ${isDragging ? 'neural-dragging' : ''}
  `.trim();

  const nodeStyle: React.CSSProperties = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'grab'
  };

  return (
    <div
      ref={nodeRef}
      className={nodeClasses}
      style={nodeStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={`${type}: ${content} (Double-clic pour éditer)`}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: '20px'
      }}>
        <span style={{ fontSize: '16px' }}>
          {getNodeIcon(type)}
        </span>

        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleEditKeyDown}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              width: '100%',
              minWidth: '80px'
            }}
          />
        ) : (
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {content}
          </span>
        )}
      </div>

      {/* Connection strength indicator */}
      {isActive && (
        <div className="connection-strength" style={{ marginTop: '8px' }} />
      )}
    </div>
  );
};

export default NeuralNode;
