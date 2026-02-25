'use client';

import React from 'react';
import Link from 'next/link';
import { Game } from '@/types/game';
import { ROUTES } from '@/config/routes';
import { EyeIcon, PlusIcon, GroupIcon, PencilIcon } from '@/icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

function getRefName(ref: unknown): string {
  if (ref == null) return '—';
  if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? '—';
  return typeof ref === 'string' ? ref : '—';
}

interface GamesTableProps {
  games: Game[];
  isLoading?: boolean;
  onDelete: (game: Game) => void;
}

export default function GamesTable({ games, isLoading, onDelete }: GamesTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading games...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No games found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Game name</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Event</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Category</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Grid Size</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Card Gen Type</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Game Type</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Winning Pattern</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Access</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Max Player</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Start Date</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game._id} className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableCell className="px-4 py-3 text-theme-sm">{game.name ?? '—'}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.event_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.category_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.grid_size_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.card_gen_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.game_type_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{getRefName(game.winning_patt_id)}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{game.access_control ? 'Closed' : 'Open'}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{game.max_player ?? '—'}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">
                  {game.game_start_date ? new Date(game.game_start_date).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm">{game.status ?? 'DRAFT'}</TableCell>
                <TableCell className="px-4 py-3 text-theme-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={ROUTES.GAMES_CREATE_DYNAMIC(game._id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 text-sm whitespace-nowrap" title="Create dynamic Game">
                      <PlusIcon className="w-4 h-4 shrink-0" />
                      <span>Create dynamic Game</span>
                    </Link>
                    <Link href={ROUTES.GAMES_PREVIEW(game._id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" title="Preview">
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <Link href={ROUTES.GAMES_EDIT(game._id)} className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" title="Edit">
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <Link href={ROUTES.GAMES_JOIN_ACCESS(game._id)} className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" title="Join & Access">
                      <GroupIcon className="w-4 h-4" />
                    </Link>
                    <button type="button" onClick={() => onDelete(game)} className="inline-flex items-center justify-center w-8 h-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
