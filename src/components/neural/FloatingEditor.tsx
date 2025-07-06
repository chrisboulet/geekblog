import React, { useState, useRef, useEffect } from 'react';

interface FloatingEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  projectName?: string;
}

const FloatingEditor: React.FC<FloatingEditorProps> = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  projectName
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Simple connection detection (words that might link to other concepts)
    const connections = words.filter(word => 
      word.startsWith('#') || 
      word.startsWith('@') ||
      word.length > 8 // Long words might be concepts
    );
    setConnectionCount(connections.length);
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
    
    // Ctrl+Enter to expand/minimize
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setIsMinimized(false);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    setIsExpanded(false);
  };

  const editorClasses = `
    floating-editor
    ${isExpanded ? 'expanded' : ''}
    ${isMinimized ? 'minimized' : ''}
  `.trim();

  return (
    <div className={editorClasses}>
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="editor-title"
          placeholder={`Titre de votre idée dans ${projectName}...`}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: isMinimized ? '18px' : '28px',
            fontWeight: '600',
            textAlign: 'center',
            width: '100%'
          }}
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMinimized}
            className="editor-expand"
            title={isMinimized ? 'Restaurer' : 'Minimiser'}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'none',
              border: 'none'
            }}
          >
            {isMinimized ? '⤢' : '⤡'}
          </button>
          
          <button
            onClick={toggleExpanded}
            className="editor-expand"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'none',
              border: 'none'
            }}
          >
            {isExpanded ? '⤓' : '⤢'}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="editor-content"
            placeholder="Commencez à écrire et observez vos idées se connecter...

Les nœuds apparaîtront automatiquement pour:
• Les concepts clés détectés par l'IA
• Les catégories suggérées (#catégorie)
• Les mentions (@référence)
• Les connexions avec vos contenus existants

Utilisez @ pour mentionner une idée
Utilisez # pour créer un tag
Utilisez Ctrl+S pour sauvegarder
Utilisez Ctrl+Enter pour agrandir"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '100%',
              minHeight: isExpanded ? '400px' : '300px',
              maxHeight: isExpanded ? '500px' : '400px',
              fontSize: '16px',
              lineHeight: '1.8',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          
          <div className="editor-footer" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid rgba(102, 126, 234, 0.2)',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              fontSize: '12px',
              color: 'var(--text-tertiary)'
            }}>
              <span>
                <span style={{ color: 'var(--neural-blue)' }}>{wordCount}</span> mots
              </span>
              <span>
                <span style={{ color: 'var(--neural-purple)' }}>{connectionCount}</span> connexions
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={onSave}
                className="neural-button"
                style={{
                  fontSize: '12px',
                  padding: '6px 12px'
                }}
                title="Ctrl+S"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </>
      )}
      
      {isMinimized && (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          {wordCount} mots • {connectionCount} connexions
        </div>
      )}
    </div>
  );
};

export default FloatingEditor;