'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAchievementCriteria } from '@/hooks/useAchievementCriteria';
import AchievementCriteriaTable from './AchievementCriteriaTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import DeleteAchievementCriteriaConfirm from './DeleteAchievementCriteriaConfirm';
import Pagination from '@/components/tables/Pagination';
import { AchievementCriteria } from '@/types/achievement-criteria';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function AchievementCriteriaList() {
  const router = useRouter();
  const { achievementCriteria, isLoading, error, refetch } = useAchievementCriteria();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingItem, setDeletingItem] = useState<AchievementCriteria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const list = Array.isArray(achievementCriteria) ? achievementCriteria : [];
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = useMemo(() => list.slice(startIndex, startIndex + ITEMS_PER_PAGE), [list, startIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [list.length, currentPage, totalPages]);

  const handleEdit = (item: AchievementCriteria) => {
    router.push(ROUTES.ACHIEVEMENT_CRITERIA_EDIT(item._id));
  };

  const handleDelete = (item: AchievementCriteria) => {
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
      const response = await fetch(API_ENDPOINTS.ACHIEVEMENT_CRITERIA.DELETE(deletingItem._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const err = await response.json().catch(() => ({ message: 'Failed to delete achievement criteria' }));
        throw new Error(err.message || 'Failed to delete achievement criteria');
      }
      showSuccessToast('Achievement criteria deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingItem(null);
      refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete achievement criteria');
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Achievement Criteria ({list.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage achievement criteria (slug is auto-generated unique)</p>
        </div>
        <Link href={ROUTES.ACHIEVEMENT_CRITERIA_ADD} title="Add Form">
          <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" title="Add Form">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {deletingItem && (
        <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
          <DeleteAchievementCriteriaConfirm achievementCriteria={deletingItem} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} />
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

      <AchievementCriteriaTable achievementCriteria={paginated} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {list.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
