'use client';

import React from 'react';
import { Event } from '@/types/event';
import { EventType } from '@/types/event-type';
import { Category } from '@/types/category';
import { Eligibility } from '@/types/eligibility';
import { GameType } from '@/types/game-type';
import { Reward } from '@/types/reward';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface EventsTableProps {
  events: Event[];
  eventTypes: EventType[];
  categories?: Category[];
  eligibilities?: Eligibility[];
  gameTypes?: GameType[];
  rewards?: Reward[];
  isLoading?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

export default function EventsTable({
  events,
  eventTypes,
  categories = [],
  eligibilities = [],
  gameTypes = [],
  rewards = [],
  isLoading,
  onEdit,
  onDelete,
}: EventsTableProps) {
  const getRefName = (ref: unknown): string => {
    if (ref == null) return '—';
    if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? '—';
    const id = typeof ref === 'string' ? ref : String(ref);
    if (!id) return '—';
    const cat = categories.find((c) => (c as { _id?: string })._id === id || (c as { id?: string }).id === id);
    if (cat) return cat.name;
    const et = eventTypes.find((e) => e._id === id);
    if (et) return et.name;
    const el = eligibilities.find((e) => (e as { _id?: string })._id === id);
    if (el) return (el as { name?: string }).name ?? '—';
    const gt = gameTypes.find((g) => g._id === id);
    if (gt) return gt.name;
    const rw = rewards.find((r) => r._id === id);
    if (rw) return rw.name;
    return id;
  };
  const getEventTypeName = (eventTypeId: string | undefined | { _id: string; name?: string }): string => getRefName(eventTypeId);
  const getCategoryName = (categoryId: string | undefined | Record<string, unknown>): string => getRefName(categoryId);
  const getEligibilityName = (eligibilityId: string | undefined | Record<string, unknown>): string => getRefName(eligibilityId);
  const getGameTypeName = (gameTypeId: string | undefined | Record<string, unknown>): string => getRefName(gameTypeId);
  const getRewardName = (rewardId: string | undefined | Record<string, unknown>): string => getRefName(rewardId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No events found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Event Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Start — End
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Eligibility
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Winning Condition
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Game Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Max Participants
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Reward
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Reward Value
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Distribution
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {event.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">
                      {event.slug}
                    </code>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {getEventTypeName(event.event_type_id)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="text-theme-sm text-gray-700 dark:text-gray-300">{getCategoryName(event.category_id)}</span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-300">{event.start_date ? new Date(event.start_date).toLocaleDateString() : '-'}</span>
                      <span className="text-gray-500 text-xs dark:text-gray-400">{event.end_date ? new Date(event.end_date).toLocaleDateString() : '-'}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="text-theme-sm text-gray-700 dark:text-gray-300">{getEligibilityName(event.eligibility_id)}</span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="text-theme-sm text-gray-700 dark:text-gray-300">{event.winning_condition || '—'}</span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="text-theme-sm text-gray-700 dark:text-gray-300">{getGameTypeName(event.game_type_id)}</span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {event.max_participants ?? '—'}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="text-theme-sm text-gray-700 dark:text-gray-300">{getRewardName(event.reward_id)}</span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {event.rewards_value != null ? event.rewards_value : '—'}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {event.distribution || '-'}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {event.status}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {event.createdAt ? new Date(event.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : '—'}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(event)}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(event)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
