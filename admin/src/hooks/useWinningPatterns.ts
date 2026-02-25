'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { WinningPattern } from '@/types/winning-pattern';

interface UseWinningPatternsReturn {
  winningPatterns: WinningPattern[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWinningPatterns(): UseWinningPatternsReturn {
  const [winningPatterns, setWinningPatterns] = useState<WinningPattern[]>([]);
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
      const response = await fetch(API_ENDPOINTS.WINNING_PATTERN.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized');
          return;
        }
        throw new Error('Failed to fetch winning patterns');
      }
      const data = await response.json();
      setWinningPatterns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setWinningPatterns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return { winningPatterns, isLoading, error, refetch: fetchList };
}
