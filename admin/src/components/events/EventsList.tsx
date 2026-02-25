'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useEventTypes } from '@/hooks/useEventTypes';
import { useCategories } from '@/hooks/useCategories';
import { useEligibility } from '@/hooks/useEligibility';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useRewards } from '@/hooks/useRewards';
import EventsTable from './EventsTable';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import DeleteEventConfirm from './DeleteEventConfirm';
import Pagination from '@/components/tables/Pagination';
import { Event } from '@/types/event';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/config/routes';
import { PlusIcon } from '@/icons';

const ITEMS_PER_PAGE = 10;

export default function EventsList() {
  const router = useRouter();
  const { events, isLoading, error, refetch } = useEvents();
  const { eventTypes } = useEventTypes();
  const { categories } = useCategories();
  const { eligibilities } = useEligibility();
  const { gameTypes } = useGameTypes();
  const { rewards } = useRewards();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = useMemo(
    () => events.slice(startIndex, endIndex),
    [events, startIndex, endIndex]
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [events.length, currentPage, totalPages]);

  const handleEdit = (event: Event) => {
    router.push(ROUTES.EVENTS_EDIT(event._id));
  };

  const handleDelete = (event: Event) => {
    setDeletingEvent(event);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent || !checkAuth()) {
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

      const response = await fetch(API_ENDPOINTS.EVENTS.DELETE(deletingEvent._id), {
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
          message: 'Failed to delete event',
        }));
        throw new Error(errorData.message || 'Failed to delete event');
      }

      // Success - show toast, close modal and refresh
      showSuccessToast('Event deleted successfully', 'Success');
      closeDeleteModal();
      setDeletingEvent(null);
      refetch();
    } catch (err) {
      console.error('Error deleting event:', err);
      showErrorToast(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteModal();
    setDeletingEvent(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Events ({events.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage events and their details
            {events.length > 0 && (
              <span className="ml-2">
                (Showing {startIndex + 1}-{Math.min(endIndex, events.length)} of {events.length})
              </span>
            )}
          </p>
        </div>
        <Link href={ROUTES.EVENTS_ADD} title="Add Form">
          <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" title="Add Form">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Delete Event Confirmation Modal */}
      {deletingEvent && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={handleDeleteCancel}
          className="max-w-[500px] p-5 lg:p-10"
        >
          <DeleteEventConfirm
            event={deletingEvent}
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

      {/* Events Table */}
      <EventsTable
        events={paginatedEvents}
        eventTypes={eventTypes}
        categories={categories}
        eligibilities={eligibilities}
        gameTypes={gameTypes}
        rewards={rewards}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {events.length > 0 && totalPages > 1 && (
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
