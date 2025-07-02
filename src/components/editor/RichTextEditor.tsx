import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
// import './RichTextEditor.css'; // Pour les styles spécifiques non gérés par prose ou Tailwind utilities

interface RichTextEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onContentChange,
  editable = true,
  placeholder = 'Commencez à écrire ici...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configuration du StarterKit si nécessaire
        // heading: { levels: [1, 2, 3] },
      }),
      Typography, // Pour les guillemets intelligents, etc.
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialContent,
    editable: editable,
    onUpdate: ({ editor: currentEditor }) => {
      if (onContentChange) {
        onContentChange(currentEditor.getHTML());
      }
    },
    // Ajout des classes Tailwind pour le style de l'éditeur lui-même
    // Note: La classe "prose" sera appliquée sur le conteneur de EditorContent
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px] p-2 text-text-primary',
      },
    },
  });

  if (!editor) {
    return null; // Ou un loader/placeholder
  }

  return (
    <div
      className={`bg-bg-secondary border border-neutral-700 rounded-md
                  prose prose-invert max-w-none
                  prose-headings:text-text-primary prose-strong:text-text-primary
                  prose-a:text-neural-pink hover:prose-a:text-neural-blue
                  prose-blockquote:border-l-neural-purple prose-blockquote:text-text-secondary
                  focus-within:border-neural-blue focus-within:ring-1 focus-within:ring-neural-blue
                  transition-colors duration-150
                  ${!editable ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {/* On pourrait ajouter une barre d'outils ici plus tard */}
      {/* <MenuBar editor={editor} /> */}
      <EditorContent editor={editor} />
    </div>
  );
};

// Exemple de barre d'outils (à développer si besoin)
// const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
//   if (!editor) return null;
//   return (
//     <div className="p-2 border-b border-neutral-700 flex space-x-1">
//       <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
//       <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
//       {/* ... autres boutons ... */}
//     </div>
//   );
// };

export default RichTextEditor;
