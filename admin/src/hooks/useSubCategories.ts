'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { SubCategory } from '@/types/subcategory';
import { useAuth } from '@/context/AuthContext';

interface UseSubCategoriesReturn {
  subcategories: SubCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage categories
 */
export function useSubCategories(): UseSubCategoriesReturn {
  const [subcategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchSubCategories = async () => {
    if (!checkAuth()) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get auth token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(API_ENDPOINTS.SUBCATEGORIES.LIST, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch roles' }));
        throw new Error(errorData.message || 'Failed to fetch roles');
      }

      const data = await response.json();
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
      setSubCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  return {
    subcategories,
    isLoading,
    error,
    refetch: fetchSubCategories,
  };
}

