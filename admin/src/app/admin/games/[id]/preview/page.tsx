'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { Game } from '@/types/game';

function getRefName(ref: unknown): string {
  if (ref == null) return '—';
  if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? '—';
  return typeof ref === 'string' ? ref : '—';
}

export default function GamePreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [game, setGame] = useState<Game | null>(null);
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
    fetch(API_ENDPOINTS.GAMES.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load game');
        return res.json();
      })
      .then((data) => setGame(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load game'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game Preview" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game Preview" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Game not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Game Preview" />
      <div className="space-y-6">
        <ComponentCard title={game.name ? `Preview: ${game.name}` : 'Game Preview'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Game name</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{game.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.event_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.category_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grid Size</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.grid_size_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Generation Type</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.card_gen_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Game Type</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.game_type_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Winning Pattern</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{getRefName(game.winning_patt_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Access</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{game.access_control ? 'Closed' : 'Open'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Player</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{game.max_player ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {game.game_start_date ? new Date(game.game_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{game.status ?? '—'}</p>
              </div>
            </div>
            {game.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-white/90 whitespace-pre-wrap">{game.description}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-white/[0.05]">
            <Link href={ROUTES.GAMES}>
              <Button type="button" size="sm" variant="outline">Back to list</Button>
            </Link>
            <Link href={ROUTES.GAMES_EDIT(game._id)}>
              <Button type="button" size="sm">Edit Game</Button>
            </Link>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
