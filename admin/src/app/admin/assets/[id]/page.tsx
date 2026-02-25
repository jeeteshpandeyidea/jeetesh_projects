'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import EditAssetForm from '@/components/assets/EditAssetForm';
import { API_ENDPOINTS } from '@/config/env';
import { Asset } from '@/types/asset';

export default function EditAssetPage() {
  const params = useParams();
  const id = params?.id as string;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
    fetch(API_ENDPOINTS.ASSETS.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load asset');
        return res.json();
      })
      .then((data) => setAsset(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load asset'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Asset" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Asset" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Asset not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Asset" />
      <div className="space-y-6">
        <ComponentCard title="Edit Asset">
          <EditAssetForm asset={asset} />
        </ComponentCard>
      </div>
    </div>
  );
}
