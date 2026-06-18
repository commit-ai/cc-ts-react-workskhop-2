import React, { useEffect, useState } from 'react';

function ActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/activity')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = entries.filter((e) =>
    e.path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="activity-log">
      <h2>Activity Log</h2>
      <input
        className="activity-filter"
        type="text"
        placeholder="Filter by path..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {loading && <p className="activity-state">Loading...</p>}
      {error && <p className="activity-state activity-error">Error: {error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p className="activity-state">No requests recorded yet.</p>
      )}
      {!loading && !error && entries.length > 0 && filtered.length === 0 && (
        <p className="activity-state">No results match "{filter}".</p>
      )}
      {!loading && !error && filtered.length > 0 && (
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
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td className={`method method-${entry.method.toLowerCase()}`}>{entry.method}</td>
                <td>{entry.path}</td>
                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                <td className={entry.status >= 400 ? 'status-error' : 'status-ok'}>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ActivityLog;
