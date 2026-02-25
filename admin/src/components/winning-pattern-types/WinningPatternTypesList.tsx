'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWinningPatternTypes } from '@/hooks/useWinningPatternTypes';
import Button from '@/components/ui/button/Button';
import Pagination from '@/components/tables/Pagination';
import { WinningPatternType } from '@/types/winning-pattern-type';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

function getPatternName(item: WinningPatternType): string {
  const ref = item.winning_pattern_id;
  if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? ref._id ?? '—';
  return ref ?? '—';
}

export default function WinningPatternTypesList() {
  const router = useRouter();
  const { winningPatternTypes, isLoading, error, refetch } = useWinningPatternTypes();
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const list = Array.isArray(winningPatternTypes) ? winningPatternTypes : [];
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = useMemo(() => list.slice(startIndex, startIndex + ITEMS_PER_PAGE), [list, startIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [list.length, currentPage, totalPages]);

  const handleEdit = (item: WinningPatternType) => {
    router.push(ROUTES.WINNING_PATTERN_TYPES_EDIT(item._id));
  };

  const handleDelete = async (item: WinningPatternType) => {
    if (!checkAuth()) {
      showErrorToast('Not authenticated. Please login again.');
      return;
    }
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.WINNING_PATTERN_TYPES.DELETE(item._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const err = await response.json().catch(() => ({ message: 'Failed to delete' }));
        throw new Error(err.message || 'Failed to delete');
      }
      showSuccessToast('Winning pattern type deleted successfully', 'Success');
      refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Winning Pattern Types ({list.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Name and slug are unique. Slug is auto-generated from name.</p>
        </div>
        <Link href={ROUTES.WINNING_PATTERN_TYPES_ADD} title="Add Winning Pattern Type">
          <Button size="sm" className="flex items-center justify-center gap-2" title="Add Winning Pattern Type">
            <PlusIcon className="w-4 h-4" />
            Add Winning Pattern Type
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button type="button" onClick={() => refetch()} className="text-sm font-medium text-red-600 hover:underline">Retry</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : list.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">No winning pattern types found.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
            <thead className="bg-gray-50 dark:bg-transparent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Winning Pattern</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0b1224] divide-y divide-gray-200 dark:divide-white/5">
              {paginated.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 text-sm">{getPatternName(item)}</td>
                  <td className="px-4 py-3 text-sm">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.slug}</td>
                  <td className="px-4 py-3 text-sm">{item.status ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(item)} className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button type="button" onClick={() => handleDelete(item)} className="inline-flex items-center justify-center w-8 h-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
