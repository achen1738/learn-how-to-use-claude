import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Ticket } from '../api/types';
import { TicketTable } from './TicketTable';

const tickets: Ticket[] = [
  {
    id: 'T-0100',
    subject: 'Printer on fire',
    customer: 'Ada Lovelace',
    status: 'pending',
    priority: 'urgent',
    assignee: null,
    createdAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'T-0101',
    subject: 'Need a receipt',
    customer: 'Grace Hopper',
    status: 'resolved',
    priority: 'low',
    assignee: 'Sam Chen',
    createdAt: '2026-10-02T12:00:00.000Z',
  },
];

describe('TicketTable', () => {
  it('renders one row per ticket with readable labels', () => {
    render(<TicketTable tickets={tickets} />);
    const rows = within(screen.getByRole('table', { name: 'Tickets' })).getAllByRole('row');
    expect(rows).toHaveLength(3); // header + 2

    const first = within(rows[1]);
    expect(first.getByText('T-0100')).toBeInTheDocument();
    expect(first.getByText('Printer on fire')).toBeInTheDocument();
    expect(first.getByText('Pending')).toBeInTheDocument();
    expect(first.getByText('Urgent')).toBeInTheDocument();
    expect(first.getByText('Unassigned')).toBeInTheDocument();

    expect(within(rows[2]).getByText('Sam Chen')).toBeInTheDocument();
  });

  it('renders just the header when there are no tickets', () => {
    render(<TicketTable tickets={[]} />);
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
