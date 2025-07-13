import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <DialogPrimitive.Content
          className={`
            fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
            neural-card p-6 w-full mx-4 ${sizeClasses[size]}
            bg-gradient-to-br from-bg-primary to-bg-secondary
            focus:outline-none focus:ring-2 focus:ring-neural-purple/50
          `}
        >
          {title && (
            <DialogPrimitive.Title className="text-xl font-semibold mb-4 neural-text-gradient">
              {title}
            </DialogPrimitive.Title>
          )}

          {children}

          <DialogPrimitive.Close asChild>
            <button
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return (
    <div className="mb-6">
      {children}
    </div>
  );
};

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      {children}
    </div>
  );
};

// Create compound component
const Modal = ModalComponent as typeof ModalComponent & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
