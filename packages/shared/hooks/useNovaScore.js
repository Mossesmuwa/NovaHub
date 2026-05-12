import { useState, useEffect } from "react";

export function useNovaScore(itemId) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await fetch(`/api/items/${itemId}/nova-score`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setScore(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (itemId) fetch();
  }, [itemId]);

  return { score, loading, error };
}
