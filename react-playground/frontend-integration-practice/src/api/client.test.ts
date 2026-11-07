import { describe, expect, it } from 'vitest';
import { ApiError, apiConfig, fetchTickets, updateTicket } from './client';

describe('fetchTickets', () => {
  it('returns one page, newest first, with the total count', async () => {
    const result = await fetchTickets({ page: 1, pageSize: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(61);
    expect(result.items[0].id).toBe('T-0061');
  });

  it('returns later pages', async () => {
    const result = await fetchTickets({ page: 2, pageSize: 10 });
    expect(result.items[0].id).toBe('T-0051');
  });

  it('filters by status and priority', async () => {
    const result = await fetchTickets({ status: 'open', priority: 'low', page: 1, pageSize: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    for (const t of result.items) {
      expect(t.status).toBe('open');
      expect(t.priority).toBe('low');
    }
  });

  it('searches id, subject and customer case-insensitively', async () => {
    const bySubject = await fetchTickets({ query: 'BILLING', page: 1, pageSize: 100 });
    expect(bySubject.total).toBeGreaterThan(0);
    bySubject.items.forEach((t) => expect(t.subject.toLowerCase()).toContain('billing'));

    const byId = await fetchTickets({ query: 't-0012', page: 1, pageSize: 100 });
    expect(byId.items.map((t) => t.id)).toEqual(['T-0012']);
  });

  it('rejects with an AbortError when the signal is aborted', async () => {
    apiConfig.setLatency(50);
    const controller = new AbortController();
    const request = fetchTickets({ page: 1, pageSize: 10 }, { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('fails the next request when asked to', async () => {
    apiConfig.failNextRequest();
    await expect(fetchTickets({ page: 1, pageSize: 10 })).rejects.toBeInstanceOf(ApiError);
    await expect(fetchTickets({ page: 1, pageSize: 10 })).resolves.toBeTruthy();
  });
});

describe('updateTicket', () => {
  it('saves the patch', async () => {
    const saved = await updateTicket('T-0012', { assignee: 'Alex Rivera' });
    expect(saved.assignee).toBe('Alex Rivera');
    const { items } = await fetchTickets({ query: 'T-0012', page: 1, pageSize: 1 });
    expect(items[0].assignee).toBe('Alex Rivera');
  });

  it('rejects with a 409 conflict for ids divisible by 7', async () => {
    await expect(updateTicket('T-0007', { assignee: 'Alex Rivera' })).rejects.toMatchObject({
      status: 409,
    });
  });
});
