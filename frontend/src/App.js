import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

function ActivityLog() {
  const [activity, setActivity] = useState([]);
  const [pathFilter, setPathFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback((filter) => {
    setLoading(true);
    setError(null);
    const url = filter ? `/activity?path=${encodeURIComponent(filter)}` : '/activity';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => { setActivity(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchActivity('');
  }, [fetchActivity]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setPathFilter(val);
    fetchActivity(val);
  };

  return (
    <div className="activity-log">
      <h2>Activity Log</h2>
      <input
        type="text"
        placeholder="Filter by path..."
        value={pathFilter}
        onChange={handleFilterChange}
        className="activity-filter"
      />
      {loading && <p>Loading...</p>}
      {error && <p className="activity-error">Error: {error}</p>}
      {!loading && !error && activity.length === 0 && <p>No activity recorded.</p>}
      {!loading && !error && activity.length > 0 && (
        <table className="activity-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.method}</td>
                <td>{entry.path}</td>
                <td>{entry.timestamp}</td>
                <td>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [view, setView] = useState('table');

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  const toggleHeroSelection = (hero) => {
    setSelectedHeroes((prev) => {
      if (prev.find((h) => h.id === hero.id)) {
        return prev.filter((h) => h.id !== hero.id);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, hero];
    });
  };

  const renderComparisonView = () => {
    const [heroA, heroB] = selectedHeroes;
    const categories = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    let winsA = 0;
    let winsB = 0;

    const rows = categories.map((cat) => {
      const valA = heroA.powerstats[cat];
      const valB = heroB.powerstats[cat];
      let classA = 'stat-tie';
      let classB = 'stat-tie';

      if (valA > valB) { classA = 'stat-winner'; classB = 'stat-loser'; winsA++; }
      else if (valB > valA) { classB = 'stat-winner'; classA = 'stat-loser'; winsB++; }

      return { cat, valA, valB, classA, classB };
    });

    let overallResult;
    if (winsA > winsB) overallResult = `${heroA.name} wins!`;
    else if (winsB > winsA) overallResult = `${heroB.name} wins!`;
    else overallResult = "It's a tie!";

    return (
      <div className="comparison-view">
        <button className="back-btn" onClick={() => { setView('table'); setSelectedHeroes([]); }}>
          Back
        </button>
        <h2>{heroA.name} vs {heroB.name}</h2>
        <div className="comparison-cards">
          <div className="hero-card">
            <img src={heroA.image} alt={heroA.name} className="hero-img" />
            <h3>{heroA.name}</h3>
          </div>
          <div className="hero-card">
            <img src={heroB.image} alt={heroB.name} className="hero-img" />
            <h3>{heroB.name}</h3>
          </div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>{heroA.name}</th>
              <th>Category</th>
              <th>{heroB.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cat, valA, valB, classA, classB }) => (
              <tr key={cat}>
                <td className={classA}>{valA}</td>
                <td className="stat-category">{cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
                <td className={classB}>{valB}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="result">{overallResult}</h2>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superheroes</h1>
        {view === 'table' ? (
          <>
            {selectedHeroes.length === 2 && (
              <button className="compare-btn" onClick={() => setView('compare')}>
                Compare {selectedHeroes[0].name} vs {selectedHeroes[1].name}
              </button>
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
                {superheroes.map((hero) => (
                  <tr
                    key={hero.id}
                    className={selectedHeroes.find((h) => h.id === hero.id) ? 'selected' : ''}
                    onClick={() => toggleHeroSelection(hero)}
                  >
                    <td>{selectedHeroes.find((h) => h.id === hero.id) ? '☑' : '☐'}</td>
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
          </>
        ) : (
          renderComparisonView()
        )}
      </header>
      <ActivityLog />
    </div>
  );
}

export default App;
