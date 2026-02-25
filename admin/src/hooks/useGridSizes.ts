import { useState, useEffect } from 'react';
import { GridSize } from '@/types/grid-size';
import { API_ENDPOINTS } from '@/config/env';

interface UseGridSizesResult {
  gridSizes: GridSize[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGridSizes(): UseGridSizesResult {
  const [gridSizes, setGridSizes] = useState<GridSize[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGridSizes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.GRID_SIZES.LIST);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch grid sizes');
      }
      const data = await response.json();
      setGridSizes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGridSizes();
  }, []);

  return {
    gridSizes,
    isLoading,
    error,
    refetch: fetchGridSizes,
  };
}