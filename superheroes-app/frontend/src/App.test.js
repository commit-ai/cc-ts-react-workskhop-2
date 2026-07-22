import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Fixture heroes — stats designed for predictable winner/tie scenarios:
//   Alpha vs Beta  → Alpha wins 4 (int, str, spd, pwr), Beta wins 2 (dur, cbt)
//   Alpha vs Delta → 3-3 tie (Alpha: int, str, spd; Delta: dur, pwr, cbt)
//   Alpha vs Gamma → per-stat tie on intelligence (both 80), Alpha wins rest
const mockHeroes = [
  { id: 1, name: 'Alpha', image: '1-alpha.jpg', powerstats: { intelligence: 80, strength: 90, speed: 70, durability: 60, power: 85, combat: 40 } },
  { id: 2, name: 'Beta',  image: '2-beta.jpg',  powerstats: { intelligence: 40, strength: 50, speed: 60, durability: 70, power: 30, combat: 90 } },
  { id: 3, name: 'Gamma', image: '3-gamma.jpg', powerstats: { intelligence: 80, strength: 20, speed: 20, durability: 20, power: 20, combat: 20 } },
  { id: 4, name: 'Delta', image: '4-delta.jpg', powerstats: { intelligence: 30, strength: 30, speed: 30, durability: 90, power: 90, combat: 90 } },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(mockHeroes) })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function renderApp() {
  render(<App />);
  await screen.findAllByRole('checkbox');
}

// ─── Heading ──────────────────────────────────────────────────────────────────

test('renders Superheroes heading', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /superheroes/i });
  expect(heading).toBeInTheDocument();
});

// ─── Checkbox rendering ───────────────────────────────────────────────────────

describe('checkbox rendering', () => {
  test('renders a checkbox for each hero row', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockHeroes.length);
  });

  test('all checkboxes are unchecked initially', async () => {
    await renderApp();
    screen.getAllByRole('checkbox').forEach(cb => expect(cb).not.toBeChecked());
  });
});

// ─── Selection logic ──────────────────────────────────────────────────────────

describe('selection logic', () => {
  test('clicking a checkbox selects that hero', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  test('clicking two checkboxes selects both heroes', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    userEvent.click(checkboxes[1]);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  test('clicking a checked checkbox deselects it', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  test('cannot select more than 2 heroes', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    userEvent.click(checkboxes[1]);
    userEvent.click(checkboxes[2]);
    expect(checkboxes[2]).not.toBeChecked();
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
});

// ─── Row-click selection ──────────────────────────────────────────────────────

describe('row-click selection', () => {
  function getRow(name) {
    return screen.getByText(name).closest('tr');
  }

  test('clicking a row selects that hero (checkbox becomes checked)', async () => {
    await renderApp();
    userEvent.click(getRow('Alpha'));
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  });

  test('clicking an already-selected row deselects it', async () => {
    await renderApp();
    userEvent.click(getRow('Alpha'));
    userEvent.click(getRow('Alpha'));
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  test('clicking a third row when 2 are selected does nothing', async () => {
    await renderApp();
    userEvent.click(getRow('Alpha'));
    userEvent.click(getRow('Beta'));
    userEvent.click(getRow('Gamma'));
    expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
  });

  test('clicking the checkbox does not double-toggle (fires once only)', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });
});

// ─── Search / filter ─────────────────────────────────────────────────────────

describe('search input', () => {
  test('renders a search input above the table', async () => {
    await renderApp();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  test('shows all heroes when search is empty', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockHeroes.length);
  });

  test('filters rows by name (case-insensitive)', async () => {
    await renderApp();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'alpha');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
    expect(screen.queryByText('Delta')).not.toBeInTheDocument();
  });

  test('filter is case-insensitive (uppercase input)', async () => {
    await renderApp();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'BETA');
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  test('partial match shows matching heroes', async () => {
    await renderApp();
    // 'ta' appears in Beta (bet-a → no; b-e-t-a → yes) and Delta (del-t-a)
    // but not in Alpha or Gamma
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'ta');
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  test('shows no rows when no hero matches', async () => {
    await renderApp();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'zzz');
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  test('shows a "no heroes found" message when search has no results', async () => {
    await renderApp();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'zzz');
    expect(screen.getByText(/no heroes found/i)).toBeInTheDocument();
  });

  test('"no heroes found" message is not shown when there are results', async () => {
    await renderApp();
    expect(screen.queryByText(/no heroes found/i)).not.toBeInTheDocument();
  });

  test('clearing the search restores all rows', async () => {
    await renderApp();
    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.type(input, 'alpha');
    await userEvent.clear(input);
    expect(screen.getAllByRole('checkbox')).toHaveLength(mockHeroes.length);
  });
});

// ─── Compare button ───────────────────────────────────────────────────────────

describe('Compare button visibility', () => {
  test('not shown with 0 heroes selected', async () => {
    await renderApp();
    expect(screen.queryByRole('button', { name: /compare/i })).not.toBeInTheDocument();
  });

  test('not shown with 1 hero selected', async () => {
    await renderApp();
    userEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.queryByRole('button', { name: /compare/i })).not.toBeInTheDocument();
  });

  test('appears when exactly 2 heroes are selected', async () => {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[0]);
    userEvent.click(checkboxes[1]);
    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
  });
});

// ─── Compare view ─────────────────────────────────────────────────────────────

describe('compare view', () => {
  async function openCompare(heroIndexA = 0, heroIndexB = 1) {
    await renderApp();
    const checkboxes = screen.getAllByRole('checkbox');
    userEvent.click(checkboxes[heroIndexA]);
    userEvent.click(checkboxes[heroIndexB]);
    userEvent.click(screen.getByRole('button', { name: /compare/i }));
  }

  test('switches to compare view on Compare click', async () => {
    await openCompare();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  test('shows both hero names', async () => {
    await openCompare();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('shows all 6 stat labels', async () => {
    await openCompare();
    ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'].forEach(stat => {
      expect(screen.getByText(new RegExp(`^${stat}$`, 'i'))).toBeInTheDocument();
    });
  });

  test('shows both heroes stat values', async () => {
    await openCompare();
    const intRow = screen.getByText(/^intelligence$/i).closest('tr');
    expect(within(intRow).getByText('80')).toBeInTheDocument(); // Alpha intelligence
    expect(within(intRow).getByText('40')).toBeInTheDocument(); // Beta intelligence
  });

  // ── Winner highlighting ──────────────────────────────────────────────────

  test('winner cell has highlight class, loser does not', async () => {
    await openCompare(0, 1); // Alpha vs Beta
    // Alpha wins intelligence (80 > 40)
    const intRow = screen.getByText(/^intelligence$/i).closest('tr');
    const intCells = within(intRow).getAllByRole('cell');
    expect(intCells[1]).toHaveClass('highlight');
    expect(intCells[2]).not.toHaveClass('highlight');

    // Beta wins durability (60 < 70)
    const durRow = screen.getByText(/^durability$/i).closest('tr');
    const durCells = within(durRow).getAllByRole('cell');
    expect(durCells[1]).not.toHaveClass('highlight');
    expect(durCells[2]).toHaveClass('highlight');
  });

  test('neither cell is highlighted when stat values are equal', async () => {
    await openCompare(0, 2); // Alpha vs Gamma — both have intelligence: 80
    const intRow = screen.getByText(/^intelligence$/i).closest('tr');
    const intCells = within(intRow).getAllByRole('cell');
    expect(intCells[1]).not.toHaveClass('highlight');
    expect(intCells[2]).not.toHaveClass('highlight');
  });

  // ── Overall winner / tie banner ──────────────────────────────────────────

  test('shows winning hero name when one hero wins more categories', async () => {
    await openCompare(0, 1); // Alpha wins 4, Beta wins 2
    expect(screen.getByText(/alpha wins/i)).toBeInTheDocument();
  });

  test('shows tie message when heroes win equal categories', async () => {
    await openCompare(0, 3); // Alpha 3, Delta 3 → tie
    expect(screen.getByText(/it'?s a tie/i)).toBeInTheDocument();
  });

  // ── Back button ─────────────────────────────────────────────────────────

  test('Back button returns to table view', async () => {
    await openCompare();
    userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(mockHeroes.length);
  });

  test('Back button clears selection — all checkboxes unchecked', async () => {
    await openCompare();
    userEvent.click(screen.getByRole('button', { name: /back/i }));
    screen.getAllByRole('checkbox').forEach(cb => expect(cb).not.toBeChecked());
  });
});
