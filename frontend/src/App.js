import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetch(`/api/superheroes?sortBy=${sortBy}&order=${sortOrder}`)
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, [sortBy]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superheroes</h1>
        <div>
          <label htmlFor="sortBy">Sort by</label>{' '}
          <select id="sortBy" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="name">Name</option>
            <option value="power">Power</option>
          </select>{' '}
          <label htmlFor="sortOrder">Order</label>{' '}
          <select id="sortOrder" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
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
              <tr key={hero.id}>
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
      </header>
    </div>
  );
}

export default App;
