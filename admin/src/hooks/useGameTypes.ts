'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { GameType } from '@/types/game-type';
import { useAuth } from '@/context/AuthContext';

interface UseGameTypesReturn {
  gameTypes: GameType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGameTypes(): UseGameTypesReturn {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchGameTypes = async () => {
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

      const response = await fetch(API_ENDPOINTS.GAME_TYPES.LIST, {
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
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch game types' }));
        throw new Error(errorData.message || 'Failed to fetch game types');
      }

      const data = await response.json();
      setGameTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching game types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch game types');
      setGameTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameTypes();
  }, []);

  return {
    gameTypes,
    isLoading,
    error,
    refetch: fetchGameTypes,
  };
}
