import React, { useState } from 'react';
import './App.css';
import useSuperheroes from './hooks/useSuperheroes';
import HeroTable from './components/HeroTable';
import CompareView from './components/CompareView';

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
      <header className="App-header">
        <h1>Superheroes</h1>
        {view === 'compare'
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
      </header>
    </div>
  );
}

export default App;
