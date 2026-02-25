'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { CardGeneration } from '@/types/card-generation';

export type CardGenerationItem = CardGeneration;

interface UseCardGenerationsReturn {
  cardGenerations: CardGeneration[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCardGenerations(): UseCardGenerationsReturn {
  const [cardGenerations, setCardGenerations] = useState<CardGenerationItem[]>([]);
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
      const response = await fetch(API_ENDPOINTS.CARD_GENERATION.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized');
          return;
        }
        throw new Error('Failed to fetch card generation types');
      }
      const data = await response.json();
      setCardGenerations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setCardGenerations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return { cardGenerations, isLoading, error, refetch: fetchList };
}
