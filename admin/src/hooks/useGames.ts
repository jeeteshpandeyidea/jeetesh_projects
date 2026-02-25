'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { Game } from '@/types/game';
import { useAuth } from '@/context/AuthContext';

interface UseGamesReturn {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGames(): UseGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchGames = async () => {
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
      const response = await fetch(API_ENDPOINTS.GAMES.LIST, {
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
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch games' }));
        throw new Error(errorData.message || 'Failed to fetch games');
      }
      const data = await response.json();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return { games, isLoading, error, refetch: fetchGames };
}
