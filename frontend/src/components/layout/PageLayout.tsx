import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  fab?: {
    icon: LucideIcon;
    onClick: () => void;
    label: string;
  };
}

/**
 * PageLayout - Main page wrapper component
 *
 * Features:
 * - No header/title at top (golden standard)
 * - Full screen content area
 * - Optional Floating Action Button (FAB) at bottom-right
 * - Responsive design with proper padding
 * - Fills entire viewport minus TitleBar and StatusBar
 * - Uses theme colors
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, fab }) => {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Main Content Area - Full Screen, Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="h-full w-full">
          {children}
        </div>
      </div>

      {/* Floating Action Button (FAB) - Bottom Right */}
      {fab && (
        <button
          onClick={fab.onClick}
          className="
            fixed bottom-6 right-6
            h-14 w-14 rounded-full
            bg-primary text-primary-foreground
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            sm:h-16 sm:w-16
            z-50
          "
          aria-label={fab.label}
          title={fab.label}
        >
          <fab.icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}
    </div>
  );
};
