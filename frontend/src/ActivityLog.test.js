import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityLog from './ActivityLog';

const mockEntries = [
  { id: '1', method: 'GET', path: '/api/superheroes', timestamp: '2026-06-18T11:40:00.000Z', status: 200 },
  { id: '2', method: 'GET', path: '/api/superheroes/1', timestamp: '2026-06-18T11:40:01.000Z', status: 200 },
  { id: '3', method: 'GET', path: '/', timestamp: '2026-06-18T11:40:02.000Z', status: 200 },
  { id: '4', method: 'POST', path: '/api/superheroes', timestamp: '2026-06-18T11:40:03.000Z', status: 404 },
];

afterEach(() => {
  jest.restoreAllMocks();
});

test('shows loading state before fetch resolves', () => {
  jest.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {})); // never resolves
  render(<ActivityLog />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('shows empty state when /activity returns empty array', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [],
  });
  render(<ActivityLog />);
  await waitFor(() => expect(screen.getByText('No requests recorded yet.')).toBeInTheDocument());
});

test('shows error state when fetch fails', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
  render(<ActivityLog />);
  await waitFor(() => expect(screen.getByText(/Error: Network error/)).toBeInTheDocument());
});

test('renders table rows with data', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockEntries,
  });
  render(<ActivityLog />);
  await waitFor(() => expect(screen.getAllByText('/api/superheroes')).toHaveLength(2));
  expect(screen.getAllByRole('row')).toHaveLength(5); // 1 header + 4 data rows
});

test('filter input shows only matching rows', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockEntries,
  });
  render(<ActivityLog />);
  await waitFor(() => expect(screen.getAllByText('/api/superheroes')).toHaveLength(2));

  const input = screen.getByPlaceholderText('Filter by path...');
  fireEvent.change(input, { target: { value: '/api' } });

  // /api/superheroes/1 row still visible
  expect(screen.getByText('/api/superheroes/1')).toBeInTheDocument();
  // Root path row should be gone (exact text match for '/')
  expect(screen.queryByText('/', { exact: true, selector: 'td' })).not.toBeInTheDocument();
  // Only header + 3 matching rows (/api/superheroes x2, /api/superheroes/1)
  expect(screen.getAllByRole('row')).toHaveLength(4);
});

test('filter shows no-results message when nothing matches', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockEntries,
  });
  render(<ActivityLog />);
  await waitFor(() => expect(screen.getAllByText('/api/superheroes')).toHaveLength(2));

  const input = screen.getByPlaceholderText('Filter by path...');
  fireEvent.change(input, { target: { value: '/nonexistent' } });

  expect(screen.getByText(/No results match/)).toBeInTheDocument();
});
