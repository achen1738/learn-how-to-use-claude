import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, getTotalPages } from './Pagination';

describe('getTotalPages', () => {
  it.each([
    [50, 10, 5],
    [51, 10, 6], // BUG-101: a partial last page still counts
    [61, 10, 7],
    [9, 10, 1],
    [0, 10, 1],
  ])('total=%i pageSize=%i -> %i pages', (total, pageSize, expected) => {
    expect(getTotalPages(total, pageSize)).toBe(expected);
  });
});

describe('Pagination', () => {
  it('shows the current page and page count', () => {
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={() => {}} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    const { rerender } = render(
      <Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    rerender(<Pagination page={5} pageSize={10} total={50} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('lets you reach a partially-filled last page', () => {
    render(<Pagination page={6} pageSize={10} total={61} onPageChange={() => {}} />);
    expect(screen.getByText('Page 6 of 7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('calls onPageChange with the new page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it('renders nothing when there are no items', () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
