import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const mockHeroes = [
  {
    id: 1,
    name: 'Superman',
    image: 'superman.jpg',
    powerstats: { intelligence: 94, strength: 100, speed: 98, durability: 95, power: 100, combat: 85 },
  },
  {
    id: 2,
    name: 'Batman',
    image: 'batman.jpg',
    powerstats: { intelligence: 100, strength: 26, speed: 27, durability: 50, power: 47, combat: 100 },
  },
  {
    id: 3,
    name: 'Wonder Woman',
    image: 'wonderwoman.jpg',
    powerstats: { intelligence: 88, strength: 100, speed: 79, durability: 90, power: 100, combat: 100 },
  },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(mockHeroes) })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Superheroes heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /superheroes/i });
  expect(heading).toBeInTheDocument();
});

test('fetches and renders hero list', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByText('Superman')).toBeInTheDocument());
  expect(screen.getByText('Batman')).toBeInTheDocument();
  expect(screen.getByText('Wonder Woman')).toBeInTheDocument();
});

test('search input filters the hero list', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  const searchInput = screen.getByPlaceholderText(/search heroes/i);
  fireEvent.change(searchInput, { target: { value: 'bat' } });

  expect(screen.queryByText('Superman')).not.toBeInTheDocument();
  expect(screen.getByText('Batman')).toBeInTheDocument();
  expect(screen.queryByText('Wonder Woman')).not.toBeInTheDocument();
});

test('search is case-insensitive', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  const searchInput = screen.getByPlaceholderText(/search heroes/i);
  fireEvent.change(searchInput, { target: { value: 'WONDER' } });

  expect(screen.getByText('Wonder Woman')).toBeInTheDocument();
  expect(screen.queryByText('Superman')).not.toBeInTheDocument();
});

test('clicking a hero row selects it', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  const supermanRow = screen.getByText('Superman').closest('tr');
  fireEvent.click(supermanRow);

  expect(supermanRow).toHaveClass('selected');
});

test('selecting two heroes shows the compare button', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  expect(screen.queryByRole('button', { name: /compare/i })).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));

  expect(screen.getByRole('button', { name: /compare superman vs batman/i })).toBeInTheDocument();
});

test('compare button shows selected hero names', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));

  const compareBtn = screen.getByRole('button', { name: /compare/i });
  expect(compareBtn).toHaveTextContent('Superman');
  expect(compareBtn).toHaveTextContent('Batman');
});

test('clicking compare opens the comparison view', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByRole('button', { name: /compare/i }));

  expect(screen.getByText('Superman vs Batman')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/search heroes/i)).not.toBeInTheDocument();
});

test('comparison view displays power stat categories', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByRole('button', { name: /compare/i }));

  expect(screen.getByText('Intelligence')).toBeInTheDocument();
  expect(screen.getByText('Strength')).toBeInTheDocument();
  expect(screen.getByText('Speed')).toBeInTheDocument();
  expect(screen.getByText('Combat')).toBeInTheDocument();
});

test('comparison view shows overall result', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByRole('button', { name: /compare/i }));

  // Superman: wins intelligence(no), strength(yes), speed(yes), durability(yes), power(yes), combat(no) = 4 wins
  // Batman: wins intelligence(yes), combat(yes) = 2 wins → Superman wins
  expect(screen.getByText('Superman wins!')).toBeInTheDocument();
});

test('back button returns to the hero list', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByRole('button', { name: /compare/i }));

  expect(screen.queryByPlaceholderText(/search heroes/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /back/i }));

  expect(screen.getByPlaceholderText(/search heroes/i)).toBeInTheDocument();
  expect(screen.getByText('Superman')).toBeInTheDocument();
});

test('back button clears hero selection', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByRole('button', { name: /compare/i }));
  fireEvent.click(screen.getByRole('button', { name: /back/i }));

  expect(screen.queryByRole('button', { name: /compare/i })).not.toBeInTheDocument();
});

test('cannot select more than two heroes', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  fireEvent.click(screen.getByText('Superman').closest('tr'));
  fireEvent.click(screen.getByText('Batman').closest('tr'));
  fireEvent.click(screen.getByText('Wonder Woman').closest('tr'));

  const wonderWomanRow = screen.getByText('Wonder Woman').closest('tr');
  expect(wonderWomanRow).not.toHaveClass('selected');
});

test('clicking a selected hero deselects it', async () => {
  render(<App />);
  await waitFor(() => screen.getByText('Superman'));

  const supermanRow = screen.getByText('Superman').closest('tr');
  fireEvent.click(supermanRow);
  expect(supermanRow).toHaveClass('selected');

  fireEvent.click(supermanRow);
  expect(supermanRow).not.toHaveClass('selected');
});
