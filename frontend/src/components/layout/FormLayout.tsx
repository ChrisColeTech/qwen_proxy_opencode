import React from 'react';
import { Save, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FormLayoutProps {
  children: React.ReactNode;
  onSave?: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  saveIcon?: LucideIcon;
  saveLabel?: string;
  cancelLabel?: string;
  additionalActions?: Array<{
    icon: LucideIcon;
    onClick: () => void;
    label: string;
    variant?: 'default' | 'danger' | 'success';
    disabled?: boolean;
  }>;
}

/**
 * FormLayout - Form page wrapper component
 *
 * Features:
 * - Full screen form layout
 * - Bottom action bar with icon-only buttons (save, cancel)
 * - Responsive with proper padding
 * - Scrollable content area
 * - Fills entire viewport minus TitleBar and StatusBar
 * - Uses theme colors
 * - Supports additional custom actions
 */
export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  onSave,
  onCancel,
  saveDisabled = false,
  saveIcon: SaveIcon = Save,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  additionalActions = [],
}) => {
  const getActionButtonStyles = (variant?: 'default' | 'danger' | 'success') => {
    const baseStyles = `
      h-12 w-12 rounded-full
      flex items-center justify-center
      transition-all duration-200
      hover:scale-110
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `;

    switch (variant) {
      case 'danger':
        return `${baseStyles} bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive`;
      case 'success':
        return `${baseStyles} bg-green-600 text-white hover:bg-green-700 focus:ring-green-600`;
      default:
        return `${baseStyles} bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary`;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>

      {/* Bottom Action Bar - Fixed at Bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-end gap-3">
            {/* Additional Custom Actions */}
            {additionalActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={getActionButtonStyles(action.variant)}
                aria-label={action.label}
                title={action.label}
              >
                <action.icon className="h-5 w-5" />
              </button>
            ))}

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className={getActionButtonStyles('danger')}
              aria-label={cancelLabel}
              title={cancelLabel}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Save Button - Only shown if onSave is provided */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={saveDisabled}
                className={getActionButtonStyles('success')}
                aria-label={saveLabel}
                title={saveLabel}
              >
                <SaveIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
