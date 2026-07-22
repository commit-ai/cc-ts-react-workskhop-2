import { useEffect, useState } from 'react';

export default function useSuperheroes() {
  const [superheroes, setSuperheroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => { setSuperheroes(data); setLoading(false); })
      .catch((error) => { console.error('Error fetching superheroes:', error); setFetchError(true); setLoading(false); });
  }, []);

  return { superheroes, loading, fetchError };
}
