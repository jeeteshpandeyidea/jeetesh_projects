'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { Asset } from '@/types/asset';
import { useAuth } from '@/context/AuthContext';

interface UseAssetsReturn {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchAssets = async () => {
    if (!checkAuth()) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }
    const listUrl = API_ENDPOINTS.ASSETS.LIST;
    if (!listUrl || listUrl.startsWith('undefined')) {
      setError('API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local');
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
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized');
          return;
        }
        const errData = await response.json().catch(() => ({ message: 'Failed to fetch assets' }));
        throw new Error(errData.message || 'Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch';
      const isNetworkError = message === 'Failed to fetch' || err instanceof TypeError;
      const friendlyMessage = isNetworkError
        ? 'Cannot reach the API. Start the API (e.g. in the api folder run: npm run start:dev) and ensure it is running (default port 3000).'
        : message;
      setError(friendlyMessage);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { assets, isLoading, error, refetch: fetchAssets };
}
