// Acceptance tests for SPEC.md. Run with: npm run test:acceptance
// Try not to read these before you finish. They only use what the spec
// promises (labels, text, URL params), so any clean implementation should pass.

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { apiConfig, fetchTickets } from '../src/api/client';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('table', { name: 'Tickets' });
  return user;
}

function bodyRows() {
  const table = screen.queryByRole('table', { name: 'Tickets' });
  return table ? within(table).getAllByRole('row').slice(1) : [];
}

async function expectEveryRow(predicate: (text: string) => boolean) {
  await waitFor(
    () => {
      const rows = bodyRows();
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(predicate(row.textContent ?? '')).toBe(true);
    },
    { timeout: 3000 },
  );
}

describe('Part 1: search', () => {
  it('filters by search text', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'billing');
    await expectEveryRow((text) => text.toLowerCase().includes('billing'));
  });

  it('shows an empty state when nothing matches', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'zzzz');
    expect(
      await screen.findByText('No tickets match your filters', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});

describe('Part 2: filters', () => {
  it('filters by status', async () => {
    const user = await renderApp();
    await user.selectOptions(screen.getByLabelText('Status'), 'resolved');
    await expectEveryRow((text) => text.includes('Resolved'));
  });

  it('filters by priority', async () => {
    const user = await renderApp();
    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent');
    await expectEveryRow((text) => text.includes('Urgent'));
  });

  it('combines search and filters', async () => {
    const user = await renderApp();
    await user.selectOptions(screen.getByLabelText('Status'), 'open');
    await user.type(screen.getByLabelText('Search tickets'), 'mobile');
    await expectEveryRow((text) => text.includes('Open') && text.toLowerCase().includes('mobile'));
  });

  it('has an "All" option that clears a filter', async () => {
    const user = await renderApp();
    await user.selectOptions(screen.getByLabelText('Status'), 'closed');
    await expectEveryRow((text) => text.includes('Closed'));
    await user.selectOptions(screen.getByLabelText('Status'), '');
    expect(await screen.findByText('T-0061', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('goes back to page 1 when a filter changes', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/^Page 2 of/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status'), 'open');
    expect(await screen.findByText(/^Page 1 of/, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('Part 3: URL state', () => {
  it('restores search, filters and page from the URL', async () => {
    window.history.replaceState(null, '', '/?q=mobile&status=open');
    await renderApp();
    expect(screen.getByLabelText('Search tickets')).toHaveValue('mobile');
    expect(screen.getByLabelText('Status')).toHaveValue('open');
    await expectEveryRow((text) => text.includes('Open') && text.toLowerCase().includes('mobile'));
  });

  it('restores the page from the URL', async () => {
    window.history.replaceState(null, '', '/?page=2');
    render(<App />);
    expect(await screen.findByText('T-0051')).toBeInTheDocument();
    expect(screen.getByText(/^Page 2 of/)).toBeInTheDocument();
  });

  it('falls back to page 1 for a garbage page param', async () => {
    window.history.replaceState(null, '', '/?page=banana');
    render(<App />);
    expect(await screen.findByText('T-0061')).toBeInTheDocument();
  });

  it('writes changes to the URL', async () => {
    const user = await renderApp();
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.type(screen.getByLabelText('Search tickets'), 'sso');
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('priority')).toBe('high');
      expect(params.get('q')).toBe('sso');
    });
  });
});

describe('Part 4: loading and errors', () => {
  it('shows an error with a working Retry button', async () => {
    apiConfig.failNextRequest();
    const user = userEvent.setup();
    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load tickets.");

    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('T-0061')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a loading indicator while the first page loads', async () => {
    apiConfig.setLatency(200);
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    await screen.findByText('T-0061');
  });
});

describe('Part 5: bug reports', () => {
  it('BUG-101: the last page of results is reachable', async () => {
    const user = await renderApp();
    expect(screen.getByText('Page 1 of 7')).toBeInTheDocument();
    for (let page = 2; page <= 7; page++) {
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await screen.findByText(`Page ${page} of 7`);
    }
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    expect(screen.getByText('T-0001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('BUG-102: results always match the latest search, even if an older request is slower', async () => {
    apiConfig.setLatency(null); // realistic timing: short queries are slow
    const user = await renderApp();
    const search = screen.getByLabelText('Search tickets');

    await user.type(search, 'bi'); // broad, slow search
    await sleep(450); // let the debounce fire so the slow request starts
    await user.type(search, 'lling'); // "billing": narrow, fast search
    await sleep(1500); // the slow "bi" response lands after the "billing" one

    await expectEveryRow((text) => text.toLowerCase().includes('billing'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('Bonus: assign to me', () => {
  it('assigns a ticket to the current user', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'T-0012');
    await waitFor(() => expect(bodyRows()).toHaveLength(1));

    const row = bodyRows()[0];
    await user.click(within(row).getByRole('button', { name: 'Assign to me' }));

    expect(await within(row).findByText('Alex Rivera')).toBeInTheDocument();
    await waitFor(async () => {
      const { items } = await fetchTickets({ query: 'T-0012', page: 1, pageSize: 1 });
      expect(items[0].assignee).toBe('Alex Rivera');
    });
  });

  it('shows the change immediately, before the server responds', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'T-0012');
    await waitFor(() => expect(bodyRows()).toHaveLength(1));

    apiConfig.setLatency(1000);
    const row = bodyRows()[0];
    await user.click(within(row).getByRole('button', { name: 'Assign to me' }));
    expect(within(row).getByText('Alex Rivera')).toBeInTheDocument();
  });

  it('rolls back and explains when the update fails', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'T-0007');
    await waitFor(() => expect(bodyRows()).toHaveLength(1));

    const row = bodyRows()[0];
    await user.click(within(row).getByRole('button', { name: 'Assign to me' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't assign T-0007. Please try again.");
    expect(within(row).getByText('Unassigned')).toBeInTheDocument();
  });

  it('does not offer the button on tickets already assigned to you', async () => {
    const user = await renderApp();
    await user.type(screen.getByLabelText('Search tickets'), 'T-0012');
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    const row = bodyRows()[0];
    await user.click(within(row).getByRole('button', { name: 'Assign to me' }));
    await within(row).findByText('Alex Rivera');
    expect(within(row).queryByRole('button', { name: 'Assign to me' })).not.toBeInTheDocument();
  });
});
