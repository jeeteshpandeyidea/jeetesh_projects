'use client';

import React from 'react';
import Link from 'next/link';
import { WinningPattern } from '@/types/winning-pattern';
import { WinningPatternType } from '@/types/winning-pattern-type';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from '@/icons';

interface WinningPatternsTableProps {
  winningPatterns: WinningPattern[];
  isLoading: boolean;
  onEdit: (item: WinningPattern) => void;
  onDelete: (item: WinningPattern) => void;
  typesByPatternId?: Record<string, WinningPatternType[]>;
}

export default function WinningPatternsTable({
  winningPatterns,
  isLoading,
  onEdit,
  onDelete,
  typesByPatternId = {},
}: WinningPatternsTableProps) {
  if (isLoading) return <div className="py-8 text-center">Loading...</div>;
  if (winningPatterns.length === 0) return <div className="py-8 text-center">No winning patterns found.</div>;

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
        <thead className="bg-gray-50 dark:bg-transparent">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Winning Pattern Types</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#0b1224] divide-y divide-gray-200 dark:divide-white/5">
          {winningPatterns.map((wp) => {
            const types = typesByPatternId[wp._id] ?? [];
            const addTypesHref = `${ROUTES.WINNING_PATTERN_TYPES_ADD}?winning_pattern_id=${encodeURIComponent(wp._id)}`;
            return (
            <tr key={wp._id}>
              <td className="px-4 py-3 text-sm">{wp.name}</td>
              <td className="px-4 py-3 text-sm">{wp.slug}</td>
              <td className="px-4 py-3 text-sm">{wp.status ?? '—'}</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex flex-col gap-1">
                  {types.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {types.map((t) => (
                        <Link
                          key={t._id}
                          href={ROUTES.WINNING_PATTERN_TYPES_EDIT(t._id)}
                          className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link href={addTypesHref} className="text-brand-600 dark:text-brand-400 hover:underline text-sm inline-flex items-center gap-1">
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Winning Types
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{wp.createdAt ? new Date(wp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(wp)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(wp)}
                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
