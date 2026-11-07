import type { ReactNode } from 'react';
import { Button } from './Button';

/** Accessible loading indicator (role="status"). */
export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="spinner">
      <span className="spinner__circle" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  /** When provided, a "Retry" button is shown. */
  onRetry?: () => void;
  /** When provided, a "Dismiss" button is shown. */
  onDismiss?: () => void;
}

/** Inline error message (role="alert"). */
export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" className="error-banner">
      <span>{message}</span>
      <span className="error-banner__actions">
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </span>
    </div>
  );
}
