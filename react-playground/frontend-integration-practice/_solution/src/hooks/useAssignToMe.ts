import { useCallback, useState } from 'react';
import { updateTicket } from '../api/client';
import type { Ticket } from '../api/types';
import { useCurrentUser } from '../auth/useCurrentUser';

type LocalUpdate = (id: string, update: (ticket: Ticket) => Ticket) => void;

/**
 * Optimistically assigns a ticket to the signed-in user, rolling back if the
 * server rejects the change.
 */
export function useAssignToMe(updateTicketLocally: LocalUpdate) {
  const user = useCurrentUser();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const setPending = useCallback((id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const assignToMe = useCallback(
    async (ticket: Ticket) => {
      const previousAssignee = ticket.assignee;
      setError(null);
      setPending(ticket.id, true);
      updateTicketLocally(ticket.id, (t) => ({ ...t, assignee: user.name }));

      try {
        await updateTicket(ticket.id, { assignee: user.name });
      } catch {
        updateTicketLocally(ticket.id, (t) => ({ ...t, assignee: previousAssignee }));
        setError(`Couldn't assign ${ticket.id}. Please try again.`);
      } finally {
        setPending(ticket.id, false);
      }
    },
    [setPending, updateTicketLocally, user.name],
  );

  const canAssign = useCallback(
    (ticket: Ticket) => ticket.assignee !== user.name,
    [user.name],
  );

  return {
    assignToMe,
    canAssign,
    isPending: (id: string) => pendingIds.has(id),
    error,
    clearError: () => setError(null),
  };
}
