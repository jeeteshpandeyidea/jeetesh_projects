'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWinningPatterns } from '@/hooks/useWinningPatterns';
import { useWinningPatternTypes } from '@/hooks/useWinningPatternTypes';
import WinningPatternsTable from './WinningPatternsTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import DeleteWinningPatternConfirm from './DeleteWinningPatternConfirm';
import Pagination from '@/components/tables/Pagination';
import { WinningPattern } from '@/types/winning-pattern';
import { WinningPatternType } from '@/types/winning-pattern-type';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function WinningPatternsList() {
  const router = useRouter();
  const { winningPatterns, isLoading, error, refetch } = useWinningPatterns();
  const { winningPatternTypes } = useWinningPatternTypes();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const typesByPatternId = useMemo(() => {
    const map: Record<string, WinningPatternType[]> = {};
    if (!Array.isArray(winningPatternTypes)) return map;
    winningPatternTypes.forEach((wpt) => {
      const id = typeof wpt.winning_pattern_id === 'string' ? wpt.winning_pattern_id : wpt.winning_pattern_id?._id;
      if (id) {
        if (!map[id]) map[id] = [];
        map[id].push(wpt);
      }
    });
    return map;
  }, [winningPatternTypes]);
  const [deletingItem, setDeletingItem] = useState<WinningPattern | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const list = Array.isArray(winningPatterns) ? winningPatterns : [];
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = useMemo(() => list.slice(startIndex, startIndex + ITEMS_PER_PAGE), [list, startIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [list.length, currentPage, totalPages]);

  const handleEdit = (item: WinningPattern) => {
    router.push(ROUTES.WINNING_PATTERN_EDIT(item._id));
  };

  const handleDelete = (item: WinningPattern) => {
    setDeletingItem(item);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem || !checkAuth()) {
      showErrorToast('Not authenticated. Please login again.');
      return;
    }
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.WINNING_PATTERN.DELETE(deletingItem._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const err = await response.json().catch(() => ({ message: 'Failed to delete winning pattern' }));
        throw new Error(err.message || 'Failed to delete winning pattern');
      }
      showSuccessToast('Winning pattern deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingItem(null);
      refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete winning pattern');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteModal();
    setDeletingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Winning Patterns ({list.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage winning patterns (slug is auto-generated unique)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.WINNING_PATTERN_ADD} title="Add Winning Pattern">
            <Button size="sm" variant="outline" className="flex items-center justify-center w-9 h-9 p-0" title="Add Form">
              <PlusIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {deletingItem && (
        <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
          <DeleteWinningPatternConfirm
            winningPattern={deletingItem}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        </Modal>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button type="button" onClick={() => refetch()} className="text-sm font-medium text-red-600 hover:underline">Retry</button>
          </div>
        </div>
      )}

      <WinningPatternsTable
        winningPatterns={paginated}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        typesByPatternId={typesByPatternId}
      />

      {list.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
