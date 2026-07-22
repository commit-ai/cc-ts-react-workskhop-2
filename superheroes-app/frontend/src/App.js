import React, { useEffect, useState } from 'react';
import './App.css';

const STATS = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => { setSuperheroes(data); setLoading(false); })
      .catch((error) => { console.error('Error fetching superheroes:', error); setFetchError(true); setLoading(false); });
  }, []);

  function toggleSelect(id) {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  }

  if (view === 'compare') {
    const [heroA, heroB] = selected.map(id => superheroes.find(h => h.id === id));
    if (!heroA || !heroB) {
      return (
        <div className="App">
          <header className="App-header">
            <h1>Superheroes</h1>
            <button onClick={() => { setView('table'); setSelected([]); }}>Back</button>
            <p>Could not load hero data. Please go back and try again.</p>
          </header>
        </div>
      );
    }
    const winsA = STATS.filter(s => heroA.powerstats[s] > heroB.powerstats[s]).length;
    const winsB = STATS.filter(s => heroB.powerstats[s] > heroA.powerstats[s]).length;
    const verdict = winsA > winsB
      ? `${heroA.name} wins!`
      : winsB > winsA
        ? `${heroB.name} wins!`
        : "It's a tie!";

    return (
      <div className="App">
        <header className="App-header">
          <h1>Superheroes</h1>
          <button onClick={() => { setView('table'); setSelected([]); }}>Back</button>
          <p className="verdict">{verdict}</p>
          <table>
            <thead>
              <tr>
                <th>Stat</th>
                <th>{heroA.name}</th>
                <th>{heroB.name}</th>
              </tr>
            </thead>
            <tbody>
              {STATS.map(stat => {
                const a = heroA.powerstats[stat];
                const b = heroB.powerstats[stat];
                return (
                  <tr key={stat}>
                    <td>{stat}</td>
                    <td className={a > b ? 'highlight' : ''}>{a}</td>
                    <td className={b > a ? 'highlight' : ''}>{b}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </header>
      </div>
    );
  }

  const filteredHeroes = superheroes.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superheroes</h1>
        <input
          type="text"
          placeholder="Search heroes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        {selected.length === 2 && (
          <button onClick={() => setView('compare')}>Compare</button>
        )}
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th>Intelligence</th>
              <th>Strength</th>
              <th>Speed</th>
              <th>Durability</th>
              <th>Power</th>
              <th>Combat</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="10" className="no-results">Loading...</td>
              </tr>
            )}
            {!loading && fetchError && (
              <tr>
                <td colSpan="10" className="no-results">Failed to load heroes. Please try again later.</td>
              </tr>
            )}
            {!loading && !fetchError && filteredHeroes.length === 0 && (
              <tr>
                <td colSpan="10" className="no-results">No heroes found</td>
              </tr>
            )}
            {filteredHeroes.map((hero) => (
              <tr key={hero.id} onClick={() => toggleSelect(hero.id)} style={{ cursor: 'pointer' }}>
                <td onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(hero.id)}
                    onChange={() => toggleSelect(hero.id)}
                  />
                </td>
                <td>{hero.id}</td>
                <td>{hero.name}</td>
                <td><img src={hero.image} alt={hero.name} width="50" /></td>
                <td>{hero.powerstats.intelligence}</td>
                <td>{hero.powerstats.strength}</td>
                <td>{hero.powerstats.speed}</td>
                <td>{hero.powerstats.durability}</td>
                <td>{hero.powerstats.power}</td>
                <td>{hero.powerstats.combat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
