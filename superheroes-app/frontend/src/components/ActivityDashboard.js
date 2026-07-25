import React, { useState, useEffect, useRef } from 'react';

function ActivityDashboard({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const timerRef = useRef(null);

  function handleFilterChange(e) {
    const value = e.target.value;
    setFilter(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedFilter(value);
    }, 300);
  }

  useEffect(() => {
    const url = debouncedFilter
      ? `/api/activity?path=${encodeURIComponent(debouncedFilter)}`
      : '/api/activity';
    fetch(url)
      .then(r => r.json())
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, [debouncedFilter]);

  return (
    <div>
      <div className="controls-row">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="search-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="Filter by path…"
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr className="state-row">
                <td colSpan={3}><span className="no-results">No activity yet.</span></td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{e.method}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{e.path}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActivityDashboard;
