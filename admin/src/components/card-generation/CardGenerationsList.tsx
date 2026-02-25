'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCardGenerations } from '@/hooks/useCardGenerations';
import CardGenerationsTable from './CardGenerationsTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import AddCardGenerationForm from './AddCardGenerationForm';
import EditCardGenerationForm from './EditCardGenerationForm';
import DeleteCardGenerationConfirm from './DeleteCardGenerationConfirm';
import Pagination from '@/components/tables/Pagination';
import { CardGeneration } from '@/types/card-generation';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function CardGenerationsList() {
  const { cardGenerations, isLoading, error, refetch } = useCardGenerations();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingItem, setEditingItem] = useState<CardGeneration | null>(null);
  const [deletingItem, setDeletingItem] = useState<CardGeneration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const totalPages = Math.ceil(cardGenerations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = useMemo(() => cardGenerations.slice(startIndex, startIndex + ITEMS_PER_PAGE), [cardGenerations, startIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [cardGenerations.length, currentPage, totalPages]);

  const handleAdded = () => { closeModal(); refetch(); };
  const handleEdit = (item: CardGeneration) => { setEditingItem(item); openEditModal(); };
  const handleUpdated = () => { closeEditModal(); setEditingItem(null); refetch(); };
  const handleEditCancel = () => { closeEditModal(); setEditingItem(null); };
  const handleDelete = (item: CardGeneration) => { setDeletingItem(item); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    if (!deletingItem || !checkAuth()) { showErrorToast('Not authenticated. Please login again.'); return; }
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.CARD_GENERATION.DELETE(deletingItem._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { showErrorToast('Unauthorized. Please login again.'); return; }
        const err = await response.json().catch(() => ({ message: 'Failed to delete card generation type' }));
        throw new Error(err.message || 'Failed to delete card generation type');
      }
      showSuccessToast('Card generation type deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingItem(null);
      refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete card generation type');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => { closeDeleteModal(); setDeletingItem(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Card Generation Types ({cardGenerations.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage card generation types (slug is auto-generated unique)</p>
        </div>
        <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" onClick={openModal} title="Add Form">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-5 lg:p-10">
        <AddCardGenerationForm onSuccess={handleAdded} onCancel={closeModal} />
      </Modal>

      {editingItem && (
        <Modal isOpen={isEditOpen} onClose={handleEditCancel} className="max-w-[600px] p-5 lg:p-10">
          <EditCardGenerationForm cardGeneration={editingItem} onSuccess={handleUpdated} onCancel={handleEditCancel} />
        </Modal>
      )}

      {deletingItem && (
        <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
          <DeleteCardGenerationConfirm cardGeneration={deletingItem} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} />
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

      <CardGenerationsTable cardGenerations={paginated} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {cardGenerations.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
