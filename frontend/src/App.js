import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [view, setView] = useState('table');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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
      <button
        className="theme-toggle"
        onClick={() => setDarkMode((prev) => !prev)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
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
    </div>
  );
}

export default App;
