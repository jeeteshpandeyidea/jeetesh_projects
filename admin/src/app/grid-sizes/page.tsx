"use client";

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/env';

export default function GridSizesPage() {
  const [gridSizes, setGridSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchGridSizes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.GRID_SIZES.LIST);
        if (!res.ok) throw new Error('Failed to fetch grid sizes');
        const data = await res.json();
        if (mounted) setGridSizes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchGridSizes();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Grid Sizes (dynamic)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <pre className="bg-gray-100 dark:bg-[#071129] p-4 rounded-md overflow-auto text-sm">{JSON.stringify(gridSizes, null, 2)}</pre>
      )}
    </div>
  );
}
