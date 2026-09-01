import { useState, useCallback } from 'react';
import { getAdminStats, getAdminSubscriptions, getAuditLogsApi, getAdminAnalyticsApi } from '../services/adminStatService';

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

export const useAdminSubscriptions = () => {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptions = useCallback(async (token) => {
    setLoading(true);
    try {
      const data = await getAdminSubscriptions(token);
      setSubData(data);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  return { subData, loading, fetchSubscriptions };
};

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = useCallback(async (token) => {
    setLoading(true);
    try {
      const data = await getAuditLogsApi(token);
      setLogs(data?.logs || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  return { logs, loading, fetchAuditLogs };
};

export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async (token) => {
    setLoading(true);
    try {
      const data = await getAdminAnalyticsApi(token);
      setAnalytics(data);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  return { analytics, loading, fetchAnalytics };
};

