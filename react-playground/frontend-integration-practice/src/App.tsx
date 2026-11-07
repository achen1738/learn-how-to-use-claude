import { useState, useEffect } from "react";
import { useCurrentUser } from "./auth/useCurrentUser";
import { TicketTable } from "./components/TicketTable";
import { Spinner } from "./components/ui/Feedback";
import { Pagination } from "./components/ui/Pagination";
import { TextInput } from "./components/ui/TextInput";
import { Select } from "./components/ui/Select";
import { useTickets } from "./hooks/useTickets";

import { STATUS_OPTIONS, PRIORITY_OPTIONS, isTicketStatus, isTicketPriority } from "./constants";
import { Button } from "./components/ui/Button";

const PAGE_SIZE = 10;

const TICKET_PRIORITY_OPTIONS = [...PRIORITY_OPTIONS, { label: "All", value: "" }];
const TICKET_STATUS_OPTIONS = [...STATUS_OPTIONS, { label: "All", value: "" }];

export default function App() {
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const debouncedQuery = useDebounce(searchString, 300);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading, error, refetch } = useTickets({
    query: debouncedQuery,
    page,
    pageSize: PAGE_SIZE,
    status: selectedStatus,
    priority: selectedPriority,
  });

  useEffect(() => {
    // Access the current URL's search string (e.g., "?search=pizza")
    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.has("q")) {
      const queryString = queryParams.get("q")!;
      setSearchString(queryString);
    }
    if (queryParams.has("status")) {
      const queryStatus = queryParams.get("status");
      if (isTicketStatus(queryStatus)) {
        setSelectedStatus(queryStatus);
      }
    }
    if (queryParams.has("priority")) {
      const queryPriority = queryParams.get("priority");
      if (isTicketPriority(queryPriority)) {
        setSelectedPriority(queryPriority);
      }
    }

    if (queryParams.has("page")) {
      const queryPage = queryParams.get("page")!;
      if (!isNaN(queryPage)) {
        const numQueryPage = parseInt(queryPage);
        const totalPages = Math.floor(data?.total ?? 0 / PAGE_SIZE) || 1;
        if (numQueryPage <= totalPages) {
          setPage(numQueryPage);
        }
      }
    }

    // Extract the value
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchString(value);
    setPage(1);
  };

  const handleSelectChange = (value: string, stateFunction: (val: string) => void) => {
    stateFunction(value);
    setPage(1);
  };

  const onRetry = () => {
    refetch();
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Support Inbox</h1>
        <span className="muted">Signed in as {user.name}</span>
      </header>

      <main className="app__main">
        {/* TODO(you): toolbar with search + filters goes here. See SPEC.md. */}
        <TextInput label="Search" value={searchString} onChange={handleSearchChange} />
        <Select
          key="status_filter"
          label="Status"
          value={selectedStatus}
          options={TICKET_STATUS_OPTIONS}
          onChange={(value: string) => handleSelectChange(value, setSelectedStatus)}
        />
        <Select
          key="priority_filter"
          label="Priority"
          value={selectedPriority}
          options={TICKET_PRIORITY_OPTIONS}
          onChange={(value: string) => handleSelectChange(value, setSelectedPriority)}
        />
        {error && <ErrorBanner onRetry={onRetry} />}
        {isLoading && !data && <Spinner />}

        {data && (
          <>
            <TicketTable tickets={data.items} refetch={refetch} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

const ErrorBanner = ({ onRetry }) => {
  return (
    <div style={styles.errorBannerContainer}>
      Couldn't load tickets. <Button onClick={onRetry}>Retry</Button>
    </div>
  );
};

const styles = {
  errorBannerContainer: {
    background: "#ff6e6e",
    color: "white",
    padding: "8px",
    borderRadius: "4px",
  },
};

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay finishes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Re-run if value or delay changes

  return debouncedValue;
}
