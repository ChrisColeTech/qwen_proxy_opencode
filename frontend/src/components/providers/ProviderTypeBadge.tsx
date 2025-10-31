import React from 'react';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ProviderType } from '@/types/provider.types';

export interface ProviderTypeBadgeProps {
  type: ProviderType;
  className?: string;
}

/**
 * ProviderTypeBadge Component
 *
 * Displays a provider type badge with appropriate color coding.
 * Color mappings:
 * - lm-studio: blue (info)
 * - qwen-proxy: green (success)
 * - qwen-direct: purple (custom purple styling)
 */
export const ProviderTypeBadge: React.FC<ProviderTypeBadgeProps> = ({
  type,
  className,
}) => {
  const getVariantAndLabel = (providerType: ProviderType) => {
    switch (providerType) {
      case 'lm-studio':
        return {
          variant: 'info' as const,
          label: 'LM Studio',
          customClass: '',
        };
      case 'qwen-proxy':
        return {
          variant: 'success' as const,
          label: 'Qwen Proxy',
          customClass: '',
        };
      case 'qwen-direct':
        return {
          variant: 'neutral' as const,
          label: 'Qwen Direct',
          customClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
      default:
        return {
          variant: 'neutral' as const,
          label: providerType,
          customClass: '',
        };
    }
  };

  const { variant, label, customClass } = getVariantAndLabel(type);

  return (
    <StatusBadge
      variant={variant}
      className={customClass || className}
    >
      {label}
    </StatusBadge>
  );
};
