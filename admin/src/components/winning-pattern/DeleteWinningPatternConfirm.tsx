'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import { WinningPattern } from '@/types/winning-pattern';

interface Props {
  winningPattern: WinningPattern;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteWinningPatternConfirm({ winningPattern, onConfirm, onCancel, isDeleting = false }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Delete Winning Pattern</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete <strong>{winningPattern.name}</strong>? This action cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isDeleting}>Cancel</Button>
        <Button size="sm" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
      </div>
    </div>
  );
}
