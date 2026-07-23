import React from 'react';

function StatBar({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="stat-bar-wrap">
      <span className="stat-num">{value}</span>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function HeroTable({ heroes, selected, loading, fetchError, search, onSearchChange, onToggleSelect, onCompare }) {
  return (
    <>
      <div className="controls-row">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search heroes..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="selection-hint">
          <div className="selection-pips">
            <div className={`pip ${selected.length >= 1 ? 'filled' : ''}`} />
            <div className={`pip ${selected.length >= 2 ? 'filled' : ''}`} />
          </div>
          <span>{selected.length}/2</span>
        </div>

        {selected.length === 2 && (
          <button className="btn-compare" onClick={onCompare}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M9 4l3 3-3 3M5 4L2 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Compare
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th className="stat-col hide-sm">Intelligence</th>
              <th className="stat-col hide-sm">Strength</th>
              <th className="stat-col hide-sm">Speed</th>
              <th className="stat-col hide-sm">Durability</th>
              <th className="stat-col hide-sm">Power</th>
              <th className="stat-col hide-sm">Combat</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="state-row">
                <td colSpan="10">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                </td>
              </tr>
            )}
            {!loading && fetchError && (
              <tr className="state-row">
                <td colSpan="10">
                  <span className="error-state">Failed to load heroes. Please try again later.</span>
                </td>
              </tr>
            )}
            {!loading && !fetchError && heroes.length === 0 && (
              <tr className="state-row">
                <td colSpan="10">
                  <span className="no-results">No heroes found</span>
                </td>
              </tr>
            )}
            {heroes.map((hero) => (
              <tr
                key={hero.id}
                onClick={() => onToggleSelect(hero.id)}
                className={selected.includes(hero.id) ? 'selected-row' : ''}
              >
                <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="hero-checkbox"
                    checked={selected.includes(hero.id)}
                    onChange={() => onToggleSelect(hero.id)}
                  />
                </td>
                <td className="id-cell">{hero.id}</td>
                <td className="name-cell">{hero.name}</td>
                <td className="img-cell">
                  <img src={hero.image} alt={hero.name} className="hero-avatar" />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.intelligence} />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.strength} />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.speed} />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.durability} />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.power} />
                </td>
                <td className="stat-cell hide-sm">
                  <StatBar value={hero.powerstats.combat} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
