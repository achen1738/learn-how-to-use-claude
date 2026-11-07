import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

function bodyRows() {
  return within(screen.getByRole('table', { name: 'Tickets' })).getAllByRole('row').slice(1);
}

describe('App', () => {
  it('shows the first page of tickets, newest first', async () => {
    render(<App />);
    expect(await screen.findByText('T-0061')).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
  });

  it('moves to the next page', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('T-0061');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('T-0051')).toBeInTheDocument();
    expect(screen.getByText(/^Page 2 of/)).toBeInTheDocument();
  });
});
