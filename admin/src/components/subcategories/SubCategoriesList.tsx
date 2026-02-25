'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSubCategories } from '@/hooks/useSubCategories';
import SubCategoriesTable from './SubCategoriesTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import AddSubCategoriesForm from './AddSubCategoriesForm';
import EditSubCategoriesForm from './EditSubCategoriesForm';
import ViewSubCategoriesModal from './ViewSubCategoriesModal';
import DeleteSubCategoriesConfirm from './DeleteSubCategoriesConfirm';
import Pagination from '@/components/tables/Pagination';
import { SubCategory } from '@/types/subcategory';
import { API_URL, API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function SubCategoriesList() {
  const { subcategories } = useSubCategories();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [viewingSubCategory, setViewingSubCategory] = useState<SubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Calculate pagination
  const totalPages = Math.ceil(subcategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCategories = useMemo(
    () => subcategories.slice(startIndex, endIndex),
    [subcategories, startIndex, endIndex]
  );

  // Reset to page 1 when categories change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [subcategories.length, currentPage, totalPages]);

  const handleSubCategoryAdded = () => {
    closeModal();
  };

  const handleEdit = (subcategory: SubCategory) => {
    setEditingSubCategory(subcategory);
    openEditModal();
  };

  const handleCategoryUpdated = () => {
    closeEditModal();
    setEditingSubCategory(null);
  };

  const handleEditCancel = () => {
    closeEditModal();
    setEditingSubCategory(null);
  };

  const handleView = (subcategory: SubCategory) => {
    setViewingSubCategory(subcategory);
    openViewModal();
  };

  const handleViewClose = () => {
    closeViewModal();
    setViewingSubCategory(null);
  };

  const handleDelete = (subcategory: SubCategory) => {
    setDeletingSubCategory(subcategory);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubCategory || !checkAuth()) {
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

      const response = await fetch(API_ENDPOINTS.SUBCATEGORIES.DELETE(deletingSubCategory._id ?? deletingSubCategory.id), {
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

      // Success - show toast, close modal and refresh
      showSuccessToast('Category deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingSubCategory(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteModal();
    setDeletingSubCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Categories ({subcategories.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage categories
            {subcategories.length > 0 && (
              <span className="ml-2">
                (Showing {startIndex + 1}-{Math.min(endIndex, subcategories.length)} of {subcategories.length})
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
        <AddSubCategoriesForm onSuccess={handleSubCategoryAdded} onCancel={closeModal} />
      </Modal>

      {/* Edit Category Modal */}
      {editingSubCategory && (
        <Modal
          isOpen={isEditOpen}
          onClose={handleEditCancel}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <EditSubCategoriesForm
            subcategory={editingSubCategory}
            onSuccess={handleCategoryUpdated}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}

      {/* View Category Modal */}
      {viewingSubCategory && (
        <Modal
          isOpen={isViewOpen}
          onClose={handleViewClose}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <ViewSubCategoriesModal subcategory={viewingSubCategory} onClose={handleViewClose} />
        </Modal>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingSubCategory && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={handleDeleteCancel}
          className="max-w-[500px] p-5 lg:p-10"
        >
          <DeleteSubCategoriesConfirm
            subcategory={deletingSubCategory}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        </Modal>
      )}
      {/*SubCategories Table */}
      <SubCategoriesTable
        subcategories={paginatedCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Pagination */}
      {subcategories.length > 0 && totalPages > 1 && (
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

