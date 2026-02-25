'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { Category } from '@/types/category';
import { useAuth } from '@/context/AuthContext';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage categories
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  const fetchCategories = async () => {
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

      const response = await fetch(API_ENDPOINTS.CATEGORIES.LIST, {
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
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}

