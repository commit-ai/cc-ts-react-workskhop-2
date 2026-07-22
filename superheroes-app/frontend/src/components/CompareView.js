import React from 'react';
import { STATS, calculateWinner } from '../utils/heroStats';

export default function CompareView({ heroA, heroB, onBack }) {
  if (!heroA || !heroB) {
    return (
      <>
        <button onClick={onBack}>Back</button>
        <p>Could not load hero data. Please go back and try again.</p>
      </>
    );
  }

  const verdict = calculateWinner(heroA, heroB);

  return (
    <>
      <button onClick={onBack}>Back</button>
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
    </>
  );
}
