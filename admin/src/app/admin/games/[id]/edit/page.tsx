'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import EditGameForm from '@/components/games/EditGameForm';
import Button from '@/components/ui/button/Button';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { Game } from '@/types/game';

export default function GameEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    if (!id) return null;
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];
    const res = await fetch(API_ENDPOINTS.GAMES.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load game');
    return res.json() as Promise<Game>;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchGame()
      .then((data) => setGame(data ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load game'))
      .finally(() => setLoading(false));
  }, [id, fetchGame]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Game" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Game" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Game not found'}</p>
          <Link href={ROUTES.GAMES} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Game" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Game</h1>
          <Link href={ROUTES.GAMES}>
            <Button type="button" size="sm" variant="outline">
              Back to games
            </Button>
          </Link>
        </div>
        <ComponentCard>
          <EditGameForm game={game} />
        </ComponentCard>
      </div>
    </div>
  );
}
