export const STATS = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

export function getBestStat(hero) {
  return STATS.reduce((best, s) => {
    const val = Number(hero.powerstats[s]) || 0;
    return val > best.value ? { name: s, value: val } : best;
  }, { name: STATS[0], value: Number(hero.powerstats[STATS[0]]) || 0 });
}

export function calculateWinner(heroA, heroB) {
  const winsA = STATS.filter(s => heroA.powerstats[s] > heroB.powerstats[s]).length;
  const winsB = STATS.filter(s => heroB.powerstats[s] > heroA.powerstats[s]).length;
  if (winsA > winsB) return `${heroA.name} wins!`;
  if (winsB > winsA) return `${heroB.name} wins!`;
  return "It's a tie!";
}
