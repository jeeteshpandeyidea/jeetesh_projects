'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { AchievementCriteria } from '@/types/achievement-criteria';
import { useAuth } from '@/context/AuthContext';

interface UseAchievementCriteriaReturn {
  achievementCriteria: AchievementCriteria[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAchievementCriteria(): UseAchievementCriteriaReturn {
  const [achievementCriteria, setAchievementCriteria] = useState<AchievementCriteria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchList = async () => {
    if (!checkAuth()) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.ACHIEVEMENT_CRITERIA.LIST, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch achievement criteria' }));
        throw new Error(errorData.message || 'Failed to fetch achievement criteria');
      }
      const data = await response.json();
      setAchievementCriteria(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievement criteria');
      setAchievementCriteria([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return { achievementCriteria, isLoading, error, refetch: fetchList };
}
