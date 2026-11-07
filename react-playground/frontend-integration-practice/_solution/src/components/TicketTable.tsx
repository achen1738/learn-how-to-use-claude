import { format, parseISO } from 'date-fns';
import type { ReactNode } from 'react';
import type { Ticket } from '../api/types';
import { PRIORITY_LABELS, PRIORITY_TONES, STATUS_LABELS, STATUS_TONES } from '../constants';
import { Badge } from './ui/Badge';

interface TicketTableProps {
  tickets: Ticket[];
  /** Optional per-row actions. When provided, an "Actions" column is added. */
  renderActions?: (ticket: Ticket) => ReactNode;
}

export function TicketTable({ tickets, renderActions }: TicketTableProps) {
  return (
    <table className="ticket-table" aria-label="Tickets">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Subject</th>
          <th scope="col">Customer</th>
          <th scope="col">Status</th>
          <th scope="col">Priority</th>
          <th scope="col">Assignee</th>
          <th scope="col">Created</th>
          {renderActions && <th scope="col">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td className="ticket-table__id">{ticket.id}</td>
            <td>{ticket.subject}</td>
            <td>{ticket.customer}</td>
            <td>
              <Badge tone={STATUS_TONES[ticket.status]}>{STATUS_LABELS[ticket.status]}</Badge>
            </td>
            <td>
              <Badge tone={PRIORITY_TONES[ticket.priority]}>
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            </td>
            <td>{ticket.assignee ?? <span className="muted">Unassigned</span>}</td>
            <td>
              <time dateTime={ticket.createdAt}>
                {format(parseISO(ticket.createdAt), 'MMM d, yyyy')}
              </time>
            </td>
            {renderActions && <td>{renderActions(ticket)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
