import type { TicketPriority, TicketStatus } from './api/types';
import type { BadgeTone } from './components/ui/Badge';
import type { SelectOption } from './components/ui/Select';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_TONES: Record<TicketStatus, BadgeTone> = {
  open: 'info',
  pending: 'warning',
  resolved: 'success',
  closed: 'neutral',
};

export const PRIORITY_TONES: Record<TicketPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export const STATUS_OPTIONS: readonly SelectOption<TicketStatus>[] = (
  Object.keys(STATUS_LABELS) as TicketStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const PRIORITY_OPTIONS: readonly SelectOption<TicketPriority>[] = (
  Object.keys(PRIORITY_LABELS) as TicketPriority[]
).map((value) => ({ value, label: PRIORITY_LABELS[value] }));

export function isTicketStatus(value: string): value is TicketStatus {
  return value in STATUS_LABELS;
}

export function isTicketPriority(value: string): value is TicketPriority {
  return value in PRIORITY_LABELS;
}
