import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    // Note: Don't auto-close here, let the parent handle it based on success/error
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <Modal.Body>
        <p className="text-text-secondary text-sm leading-relaxed">
          {description}
        </p>
      </Modal.Body>
      
      <Modal.Footer>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="neural-button neural-interactive neural-clickable neural-focusable disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={`
            neural-interactive neural-clickable neural-focusable disabled:opacity-50
            ${isDestructive 
              ? 'neural-button border-red-500 text-red-400 hover:bg-red-500/10' 
              : 'neural-button-primary'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {confirmText}
            </span>
          ) : (
            confirmText
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;