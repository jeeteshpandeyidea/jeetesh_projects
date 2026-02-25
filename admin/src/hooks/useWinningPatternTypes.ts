'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { WinningPatternType } from '@/types/winning-pattern-type';

interface UseWinningPatternTypesReturn {
  winningPatternTypes: WinningPatternType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWinningPatternTypes(): UseWinningPatternTypesReturn {
  const [winningPatternTypes, setWinningPatternTypes] = useState<WinningPatternType[]>([]);
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
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.WINNING_PATTERN_TYPES.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized');
          return;
        }
        throw new Error('Failed to fetch winning pattern types');
      }
      const data = await response.json();
      setWinningPatternTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setWinningPatternTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return { winningPatternTypes, isLoading, error, refetch: fetchList };
}
