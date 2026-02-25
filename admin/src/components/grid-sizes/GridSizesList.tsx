'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGridSizes } from '@/hooks/useGridSizes';
import GridSizesTable from './GridSizesTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import AddGridSizeForm from './AddGridSizeForm';
import EditGridSizeForm from './EditGridSizeForm';
import DeleteGridSizeConfirm from './DeleteGridSizeConfirm';
import Pagination from '@/components/tables/Pagination';
import { GridSize } from '@/types/grid-size';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function GridSizesList() {
  const { gridSizes, isLoading, error, refetch } = useGridSizes();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingGridSize, setEditingGridSize] = useState<GridSize | null>(null);
  const [deletingGridSize, setDeletingGridSize] = useState<GridSize | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const totalPages = Math.ceil(gridSizes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = useMemo(() => gridSizes.slice(startIndex, endIndex), [gridSizes, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [gridSizes.length, currentPage, totalPages]);

  const handleAdded = () => { closeModal(); refetch(); };
  const handleEdit = (item: GridSize) => { setEditingGridSize(item); openEditModal(); };
  const handleUpdated = () => { closeEditModal(); setEditingGridSize(null); refetch(); };
  const handleEditCancel = () => { closeEditModal(); setEditingGridSize(null); };
  const handleDelete = (item: GridSize) => { setDeletingGridSize(item); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    if (!deletingGridSize || !checkAuth()) { showErrorToast('Not authenticated. Please login again.'); return; }
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.GRID_SIZES.DELETE(deletingGridSize._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { showErrorToast('Unauthorized. Please login again.'); return; }
        const err = await response.json().catch(() => ({ message: 'Failed to delete grid size' }));
        throw new Error(err.message || 'Failed to delete grid size');
      }
      showSuccessToast('Grid size deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingGridSize(null);
      refetch();
    } catch (err) {
      console.error('Error deleting grid size:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete grid size');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => { closeDeleteModal(); setDeletingGridSize(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Grid Sizes ({gridSizes.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage grid sizes and their details</p>
        </div>
        <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" onClick={openModal} title="Add Form">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-5 lg:p-10">
        <AddGridSizeForm onSuccess={handleAdded} onCancel={closeModal} />
      </Modal>

      {editingGridSize && (
        <Modal isOpen={isEditOpen} onClose={handleEditCancel} className="max-w-[600px] p-5 lg:p-10">
          <EditGridSizeForm gridSize={editingGridSize} onSuccess={handleUpdated} onCancel={handleEditCancel} />
        </Modal>
      )}

      {deletingGridSize && (
        <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
          <DeleteGridSizeConfirm gridSize={deletingGridSize} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} />
        </Modal>
      )}

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

      <GridSizesTable gridSizes={paginated} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {gridSizes.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
