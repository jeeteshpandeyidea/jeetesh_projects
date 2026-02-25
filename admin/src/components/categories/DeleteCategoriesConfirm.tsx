'use client';

import React from 'react';
import { Category } from '@/types/category';
import Button from '@/components/ui/button/Button';

interface DeleteCategoriesConfirmProps {
  category: Category;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteCategoriesConfirm({
  category,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteCategoriesConfirmProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900/30">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4v2m0 4v2M3 9a9 9 0 019-9 9 9 0 019 9M3 21a9 9 0 019 9 9 9 0 019-9"
          />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Delete Category</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{category.name}</strong>? This action cannot be undone.
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isDeleting}
          type="button"
        >
          Cancel
        </Button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
