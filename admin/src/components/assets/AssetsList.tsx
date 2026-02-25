'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAssets } from '@/hooks/useAssets';
import AssetsTable from './AssetsTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import DeleteAssetConfirm from './DeleteAssetConfirm';
import Pagination from '@/components/tables/Pagination';
import { Asset } from '@/types/asset';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function AssetsList() {
  const router = useRouter();
  const { assets, isLoading, error, refetch } = useAssets();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const list = Array.isArray(assets) ? assets : [];
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = useMemo(() => list.slice(startIndex, startIndex + ITEMS_PER_PAGE), [list, startIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [list.length, currentPage, totalPages]);

  const handleEdit = (item: Asset) => router.push(ROUTES.ASSETS_EDIT(item._id));
  const handleDelete = (item: Asset) => { setDeletingAsset(item); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    if (!deletingAsset || !checkAuth()) {
      showErrorToast('Not authenticated. Please login again.');
      return;
    }
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.ASSETS.DELETE(deletingAsset._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const err = await response.json().catch(() => ({ message: 'Failed to delete asset' }));
        throw new Error(err.message || 'Failed to delete asset');
      }
      showSuccessToast('Asset deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingAsset(null);
      refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => { closeDeleteModal(); setDeletingAsset(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Assets ({list.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage assets (images, placeholders, categories)</p>
        </div>
        <Link href={ROUTES.ASSETS_ADD} title="Add Asset">
          <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" title="Add Asset">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
        {deletingAsset ? <DeleteAssetConfirm asset={deletingAsset} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} /> : null}
      </Modal>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button onClick={refetch} className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Retry</button>
          </div>
        </div>
      )}

      <AssetsTable assets={paginated} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {list.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
