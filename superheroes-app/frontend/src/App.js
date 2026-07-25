import React, { useState } from 'react';
import './App.css';
import useSuperheroes from './hooks/useSuperheroes';
import HeroTable from './components/HeroTable';
import CompareView from './components/CompareView';
import ActivityDashboard from './components/ActivityDashboard';

function App() {
  const { superheroes, loading, fetchError } = useSuperheroes();
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');

  function toggleSelect(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      else if (prev.length < 2) return [...prev, id];
      return prev;
    });
  }

  const filteredHeroes = superheroes.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  const [heroA, heroB] = selected.map(id => superheroes.find(h => h.id === id));

  return (
    <div className="App">
      <div className="App-header">
        <header className="top-bar">
          <h1>
            <span className="logo-icon" aria-hidden="true">S</span>
            Superheroes
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!loading && !fetchError && (
              <span className="hero-count">{superheroes.length} heroes</span>
            )}
            <button className="btn-back" onClick={() => setView('activity')}>Activity</button>
          </div>
        </header>

        {view === 'activity'
          ? <ActivityDashboard onBack={() => setView('table')} />
          : view === 'compare'
          ? <CompareView heroA={heroA} heroB={heroB} onBack={() => { setView('table'); setSelected([]); }} />
          : <HeroTable
              heroes={filteredHeroes}
              selected={selected}
              loading={loading}
              fetchError={fetchError}
              search={search}
              onSearchChange={setSearch}
              onToggleSelect={toggleSelect}
              onCompare={() => setView('compare')}
            />
        }
      </div>
    </div>
  );
}

export default App;
