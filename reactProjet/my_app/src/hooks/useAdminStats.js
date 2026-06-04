import { useState, useCallback } from 'react';
import { getAdminStats } from '../services/adminStatService';

export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminStats = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats(token);
      setStats(data?.stats);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchAdminStats };
};
