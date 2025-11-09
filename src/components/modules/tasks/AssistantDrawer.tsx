'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

interface AssistantDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
}

/**
 * AssistantDrawer - Componente drawer responsivo para o assistente de IA
 * 
 * Em telas grandes (lg:), é renderizado como parte do layout grid.
 * Em telas pequenas, é renderizado como um drawer overlay que desliza pela direita.
 */
export function AssistantDrawer({
  isOpen,
  onOpenChange,
  children,
  title = 'Assistente',
}: AssistantDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm rounded-none">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose asChild>
            <button className="p-1 hover:bg-muted rounded-md">
              <X className="h-4 w-4" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
