import { Button } from './Button';

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  /** Total number of items across all pages. */
  total: number;
  onPageChange: (page: number) => void;
}

/** Number of pages needed to show `total` items, `pageSize` at a time (at least 1). */
export function getTotalPages(total: number, pageSize: number): number {
  // BUG-101 fix: Math.floor dropped the last, partially-filled page.
  return Math.max(1, Math.ceil(total / pageSize));
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const totalPages = getTotalPages(total, pageSize);

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="pagination__label">
        Page {page} of {totalPages}
      </span>
      <Button size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}
