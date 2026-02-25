'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import GameJoinAccessCard from '@/components/games/GameJoinAccessCard';
import { API_ENDPOINTS } from '@/config/env';
import { Game } from '@/types/game';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'SCHEDULED', label: 'SCHEDULED' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'COMPLETED', label: 'COMPLETED' },
] as const;

export default function GameDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [starting, setStarting] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { user } = useAuth();

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
      .then((data) => {
        setGame(data ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load game'))
      .finally(() => setLoading(false));
  }, [id, fetchGame]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !game || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];
      const res = await fetch(API_ENDPOINTS.GAMES.UPDATE(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Bypass': 'true', // admin can start game without players
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update status' }));
        throw new Error(err.message || 'Failed to update status');
      }
      const updated = await res.json();
      setGame(updated);
      showSuccessToast('Status updated', 'Success');
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleStartGame = async () => {
    if (!id || !game || starting) return;
    if (game.status !== 'DRAFT' && game.status !== 'SCHEDULED') {
      showErrorToast('Game can only be started when status is DRAFT or SCHEDULED');
      return;
    }
    setStarting(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];
      const res = await fetch(API_ENDPOINTS.GAMES.START(id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Bypass': 'true',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to start game' }));
        throw new Error(err.message || 'Failed to start game');
      }
      const updated = await res.json();
      setGame(updated);
      showSuccessToast('Game started', 'Success');
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Game not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Game" />
      <div className="space-y-6">
        <ComponentCard title="Status">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="game-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Game status
            </label>
            <select
              id="game-status"
              value={game.status ?? 'DRAFT'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {(game.status === 'DRAFT' || game.status === 'SCHEDULED') && (
              <button
                type="button"
                onClick={handleStartGame}
                disabled={starting}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-brand-700 disabled:opacity-50"
              >
                {starting ? 'Starting…' : 'Start game'}
              </button>
            )}
            {statusUpdating && (
              <span className="text-sm text-gray-500 dark:text-gray-400">Updating…</span>
            )}
            {game.winner_id && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Winner: {typeof game.winner_id === 'object' ? (game.winner_id.fullName ?? game.winner_id.email ?? game.winner_id._id) : game.winner_id}
              </span>
            )}
          </div>
        </ComponentCard>
        <ComponentCard title="Join & Access">
          <GameJoinAccessCard
            game={game}
            currentUserId={user?._id ?? user?.id ?? ''}
            onGameUpdated={() => fetchGame().then((data) => data && setGame(data))}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
