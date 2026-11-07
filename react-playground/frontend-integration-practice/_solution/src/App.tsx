import { useCurrentUser } from './auth/useCurrentUser';
import { TicketTable } from './components/TicketTable';
import { TicketToolbar } from './components/TicketToolbar';
import { Button } from './components/ui/Button';
import { EmptyState, ErrorBanner, Spinner } from './components/ui/Feedback';
import { Pagination } from './components/ui/Pagination';
import { useAssignToMe } from './hooks/useAssignToMe';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useTicketFilters } from './hooks/useTicketFilters';
import { useTickets } from './hooks/useTickets';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function App() {
  const user = useCurrentUser();
  const { filters, setSearch, setStatus, setPriority, setPage } = useTicketFilters();
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, error, refetch, updateTicketLocally } = useTickets({
    query: debouncedSearch.trim() || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
  });

  const assign = useAssignToMe(updateTicketLocally);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Support Inbox</h1>
        <span className="muted">Signed in as {user.name}</span>
      </header>

      <main className="app__main">
        <TicketToolbar
          search={filters.search}
          status={filters.status}
          priority={filters.priority}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
        />

        {error && <ErrorBanner message="Couldn't load tickets." onRetry={refetch} />}
        {assign.error && <ErrorBanner message={assign.error} onDismiss={assign.clearError} />}

        {isLoading && !data && <Spinner />}

        {data && data.total === 0 && (
          <EmptyState
            title="No tickets match your filters"
            description="Try a different search or clear a filter."
          />
        )}

        {data && data.total > 0 && (
          <div aria-busy={isLoading} className={isLoading ? 'is-refreshing' : undefined}>
            <TicketTable
              tickets={data.items}
              renderActions={(ticket) =>
                assign.canAssign(ticket) && (
                  <Button
                    size="sm"
                    disabled={assign.isPending(ticket.id)}
                    onClick={() => assign.assignToMe(ticket)}
                  >
                    Assign to me
                  </Button>
                )
              }
            />
            <Pagination
              page={filters.page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
