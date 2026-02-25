'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { Reward } from '@/types/reward';
import { useAuth } from '@/context/AuthContext';

interface UseRewardsReturn {
  rewards: Reward[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRewards(): UseRewardsReturn {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchRewards = async () => {
    if (!checkAuth()) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.REWARDS.LIST, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch rewards' }));
        throw new Error(errorData.message || 'Failed to fetch rewards');
      }
      const data = await response.json();
      setRewards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  return { rewards, isLoading, error, refetch: fetchRewards };
}
