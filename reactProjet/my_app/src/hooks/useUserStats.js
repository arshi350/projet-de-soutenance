import { useState, useCallback } from 'react';
import { getUserStats } from '../services/statsServices';

export const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserStats = useCallback(async (userId, token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserStats(userId, token);
      setStats(data?.stats);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchUserStats };
};
