'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import CategoriesTable from './CategoriesTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import AddCategoriesForm from './AddCategoriesForm';
import EditCategoriesForm from './EditCategoriesForm';
import ViewCategoriesModal from './ViewCategoriesModal';
import DeleteCategoriesConfirm from './DeleteCategoriesConfirm';
import Pagination from '@/components/tables/Pagination';
import { Category } from '@/types/category';
import { API_URL, API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function CategoriesList() {
  const { categories, refetch: refetchCategories } = useCategories();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Calculate pagination
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCategories = useMemo(
    () => categories.slice(startIndex, endIndex),
    [categories, startIndex, endIndex]
  );

  // Reset to page 1 when categories change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [categories.length, currentPage, totalPages]);

  const handleCategoryAdded = () => {
    closeModal();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    openEditModal();
  };

  const handleCategoryUpdated = () => {
    closeEditModal();
    setEditingCategory(null);
  };

  const handleEditCancel = () => {
    closeEditModal();
    setEditingCategory(null);
  };

  const handleView = (category: Category) => {
    setViewingCategory(category);
    openViewModal();
  };

  const handleViewClose = () => {
    closeViewModal();
    setViewingCategory(null);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory || !checkAuth()) {
      showErrorToast('Not authenticated. Please login again.');
      return;
    }

    setIsDeleting(true);

    try {
      // Get auth token from cookie
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];

      const categoryId = (deletingCategory as { _id?: string })._id ?? deletingCategory.id;
      if (!categoryId) {
        showErrorToast('Category ID is missing');
        return;
      }
      const response = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(categoryId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: 'Failed to delete category',
        }));
        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Success - show toast, close modal and refresh list so deleted row disappears
      showSuccessToast('Category deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingCategory(null);
      await refetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteModal();
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Categories ({categories.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage categories
            {categories.length > 0 && (
              <span className="ml-2">
                (Showing {startIndex + 1}-{Math.min(endIndex, categories.length)} of {categories.length})
              </span>
            )}
          </p>
        </div>
        <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" onClick={openModal} title="Add Form">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <AddCategoriesForm onSuccess={handleCategoryAdded} onCancel={closeModal} />
      </Modal>

      {/* Edit Category Modal */}
      {editingCategory && (
        <Modal
          isOpen={isEditOpen}
          onClose={handleEditCancel}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <EditCategoriesForm
            category={editingCategory}
            onSuccess={handleCategoryUpdated}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <Modal
          isOpen={isViewOpen}
          onClose={handleViewClose}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <ViewCategoriesModal category={viewingCategory} onClose={handleViewClose} />
        </Modal>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingCategory && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={handleDeleteCancel}
          className="max-w-[500px] p-5 lg:p-10"
        >
          <DeleteCategoriesConfirm
            category={deletingCategory}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        </Modal>
      )}

      {/* Categories Table */}
      <CategoriesTable
        categories={paginatedCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Pagination */}
      {categories.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

