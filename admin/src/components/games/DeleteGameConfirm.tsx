'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import { Game } from '@/types/game';

function getEventName(ref: Game['event_id']): string {
  if (!ref) return '—';
  if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? '—';
  return String(ref);
}

interface Props {
  game: Game;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteGameConfirm({ game, onConfirm, onCancel, isDeleting = false }: Props) {
  const label = game.name?.trim() || getEventName(game.event_id);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Delete Game</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete the game <strong>{label}</strong>? This action cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isDeleting}>Cancel</Button>
        <Button size="sm" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
      </div>
    </div>
  );
}
