import { format, parseISO } from "date-fns";
import type { Ticket } from "../api/types";
import { PRIORITY_LABELS, PRIORITY_TONES, STATUS_LABELS, STATUS_TONES } from "../constants";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { updateTicket } from "../api/client";
import { useState } from "react";
interface TicketTableProps {
  tickets: Ticket[];
  refetch: () => void;
}

export function TicketTable({ tickets, refetch }: TicketTableProps) {
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
                {format(parseISO(ticket.createdAt), "MMM d, yyyy")}
              </time>
            </td>
            <td>
              {!ticket.assignee && <AssignToMeField ticketId={ticket.id} refetch={refetch} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const AssignToMeField = ({ ticketId, refetch, setError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAssignToMe = async () => {
    try {
      setIsLoading(true);
      await updateTicket(ticketId, { assignee: "me" });
      refetch();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setError(e);
      console.error(e);
    }
  };

  return (
    <Button disabled={isLoading} onClick={handleAssignToMe}>
      Assign to me
    </Button>
  );
};
