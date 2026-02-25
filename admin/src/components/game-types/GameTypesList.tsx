'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGameTypes } from '@/hooks/useGameTypes';
import GameTypesTable from './GameTypesTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import AddGameTypeForm from './AddGameTypeForm';
import EditGameTypeForm from './EditGameTypeForm';
import DeleteGameTypeConfirm from './DeleteGameTypeConfirm';
import Pagination from '@/components/tables/Pagination';
import { GameType } from '@/types/game-type';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function GameTypesList() {
  const { gameTypes, isLoading, error, refetch } = useGameTypes();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingGameType, setEditingGameType] = useState<GameType | null>(null);
  const [deletingGameType, setDeletingGameType] = useState<GameType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const totalPages = Math.ceil(gameTypes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = useMemo(() => gameTypes.slice(startIndex, endIndex), [gameTypes, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [gameTypes.length, currentPage, totalPages]);

  const handleAdded = () => { closeModal(); refetch(); };
  const handleEdit = (item: GameType) => { setEditingGameType(item); openEditModal(); };
  const handleUpdated = () => { closeEditModal(); setEditingGameType(null); refetch(); };
  const handleEditCancel = () => { closeEditModal(); setEditingGameType(null); };
  const handleDelete = (item: GameType) => { setDeletingGameType(item); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    if (!deletingGameType || !checkAuth()) { showErrorToast('Not authenticated. Please login again.'); return; }
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const response = await fetch(API_ENDPOINTS.GAME_TYPES.DELETE(deletingGameType._id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { showErrorToast('Unauthorized. Please login again.'); return; }
        const err = await response.json().catch(() => ({ message: 'Failed to delete game type' }));
        throw new Error(err.message || 'Failed to delete game type');
      }
      showSuccessToast('Game type deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingGameType(null);
      refetch();
    } catch (err) {
      console.error('Error deleting game type:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete game type');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => { closeDeleteModal(); setDeletingGameType(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Game Types ({gameTypes.length})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage game types and their details</p>
        </div>
        <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" onClick={openModal} title="Add Form">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-5 lg:p-10">
        <AddGameTypeForm onSuccess={handleAdded} onCancel={closeModal} />
      </Modal>

      {editingGameType && (
        <Modal isOpen={isEditOpen} onClose={handleEditCancel} className="max-w-[600px] p-5 lg:p-10">
          <EditGameTypeForm gameType={editingGameType} onSuccess={handleUpdated} onCancel={handleEditCancel} />
        </Modal>
      )}

      {deletingGameType && (
        <Modal isOpen={isDeleteOpen} onClose={handleDeleteCancel} className="max-w-[500px] p-5 lg:p-10">
          <DeleteGameTypeConfirm gameType={deletingGameType} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} />
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

      <GameTypesTable gameTypes={paginated} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {gameTypes.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
