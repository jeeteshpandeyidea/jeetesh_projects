'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import EditWinningPatternTypeForm from '@/components/winning-pattern-types/EditWinningPatternTypeForm';
import { API_ENDPOINTS } from '@/config/env';
import { WinningPatternType } from '@/types/winning-pattern-type';

export default function EditWinningPatternTypePage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<WinningPatternType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];
    fetch(API_ENDPOINTS.WINNING_PATTERN_TYPES.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load winning pattern type');
        return res.json();
      })
      .then((data) => setItem(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Winning Pattern Type" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Winning Pattern Type" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Winning pattern type not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Winning Pattern Type" />
      <div className="space-y-6">
        <ComponentCard title="Edit Winning Pattern Type">
          <EditWinningPatternTypeForm item={item} />
        </ComponentCard>
      </div>
    </div>
  );
}
