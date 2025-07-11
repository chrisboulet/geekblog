import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

interface DropdownMenuItemProps {
  onSelect?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

interface DropdownMenuSeparatorProps {}

const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({ 
  trigger, 
  children, 
  align = 'end',
  side = 'bottom'
}) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          side={side}
          sideOffset={8}
          className="neural-card p-2 min-w-48 z-50 shadow-lg"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  onSelect, 
  children, 
  disabled = false,
  destructive = false 
}) => {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      disabled={disabled}
      className={`
        px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-neural-purple/50
        ${disabled 
          ? 'text-text-disabled cursor-not-allowed' 
          : destructive
            ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
            : 'text-text-primary hover:bg-neural-purple/10 hover:text-neural-purple'
        }
      `}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
};

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = () => {
  return (
    <DropdownMenuPrimitive.Separator className="my-1 h-px bg-neural-purple/20" />
  );
};

// Create compound component
const DropdownMenu = DropdownMenuComponent as typeof DropdownMenuComponent & {
  Item: typeof DropdownMenuItem;
  Separator: typeof DropdownMenuSeparator;
};

DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Separator = DropdownMenuSeparator;

export default DropdownMenu;