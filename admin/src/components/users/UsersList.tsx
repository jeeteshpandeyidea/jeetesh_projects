'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import UsersTable from './UsersTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import DeleteUserConfirm from './DeleteUserConfirm';
import Pagination from '@/components/tables/Pagination';
import { User } from '@/types/user';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function UsersList() {
  const { users, isLoading, error, refetch } = useUsers();
  const router = useRouter();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Calculate pagination
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = useMemo(
    () => users.slice(startIndex, endIndex),
    [users, startIndex, endIndex]
  );

  // Reset to page 1 when users change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [users.length, currentPage, totalPages]);

  const handleEdit = (user: User) => {
    router.push(ROUTES.USERS_EDIT(user._id));
  };

  const handleView = (user: User) => {
    router.push(ROUTES.USERS_VIEW(user._id));
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || !checkAuth()) {
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

      const response = await fetch(API_ENDPOINTS.USERS.DELETE(deletingUser._id), {
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
          message: 'Failed to delete user',
        }));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Success - show toast, close modal and refresh
      showSuccessToast('User deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingUser(null);
      refetch();
    } catch (err) {
      console.error('Error deleting user:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteModal();
    setDeletingUser(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Users ({users.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage users and their roles
            {users.length > 0 && (
              <span className="ml-2">
                (Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length})
              </span>
            )}
          </p>
        </div>
        <Link href={ROUTES.USERS_ADD}>
          <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" title="Add User">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={handleDeleteCancel}
          className="max-w-[500px] p-5 lg:p-10"
        >
          <DeleteUserConfirm
            user={deletingUser}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        </Modal>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <UsersTable
        users={paginatedUsers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Pagination */}
      {users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
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

