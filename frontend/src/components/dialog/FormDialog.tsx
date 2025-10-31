import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  fullScreen = false,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          fullScreen
            ? 'h-screen max-h-screen w-screen max-w-none rounded-none p-0'
            : 'max-w-3xl',
          'gap-0',
          className
        )}
      >
        <DialogHeader className={cn(fullScreen ? 'px-6 py-4 border-b' : '')}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div
          className={cn(
            'overflow-y-auto',
            fullScreen ? 'flex-1 px-6 py-4' : 'px-6 pb-6'
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
