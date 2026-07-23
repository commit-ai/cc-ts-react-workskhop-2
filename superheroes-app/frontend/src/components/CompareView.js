import React from 'react';
import { STATS, calculateWinner } from '../utils/heroStats';

function trophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 2h6M4 2c0 4-1.5 5-3 5h14c-1.5 0-3-1-3-5M8 9v4M5 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function CompareView({ heroA, heroB, onBack }) {
  if (!heroA || !heroB) {
    return (
      <>
        <div className="compare-header">
          <button className="btn-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
        <p className="no-results">Could not load hero data. Please go back and try again.</p>
      </>
    );
  }

  const verdict = calculateWinner(heroA, heroB);
  const isWinnerA = verdict === `${heroA.name} wins!`;
  const isWinnerB = verdict === `${heroB.name} wins!`;
  const isTie = !isWinnerA && !isWinnerB;

  return (
    <>
      <div className="compare-header">
        <button className="btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      <div className="compare-hero-cards">
        <div className={`compare-hero-card ${isWinnerA ? 'winner-card' : ''}`}>
          <img src={heroA.image} alt={heroA.name} className="compare-hero-img" />
        </div>

        <div className="compare-vs-badge">VS</div>

        <div className={`compare-hero-card ${isWinnerB ? 'winner-card' : ''}`}>
          <img src={heroB.image} alt={heroB.name} className="compare-hero-img" />
        </div>
      </div>

      <div className={`verdict-banner ${isTie ? 'tie-verdict' : 'winner-verdict'}`}>
        {!isTie && trophyIcon()}
        <span className="verdict">{verdict}</span>
      </div>

      <div className="compare-table-wrapper">
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
      </div>
    </>
  );
}
