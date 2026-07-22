import React from 'react';

export default function HeroTable({ heroes, selected, loading, fetchError, search, onSearchChange, onToggleSelect, onCompare }) {
  return (
    <>
      <input
        type="text"
        placeholder="Search heroes..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="search-input"
      />
      {selected.length === 2 && (
        <button onClick={onCompare}>Compare</button>
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
          {!loading && !fetchError && heroes.length === 0 && (
            <tr>
              <td colSpan="10" className="no-results">No heroes found</td>
            </tr>
          )}
          {heroes.map((hero) => (
            <tr key={hero.id} onClick={() => onToggleSelect(hero.id)} style={{ cursor: 'pointer' }}>
              <td onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.includes(hero.id)}
                  onChange={() => onToggleSelect(hero.id)}
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
    </>
  );
}
