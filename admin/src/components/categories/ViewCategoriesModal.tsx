'use client';

import React from 'react';
import { Category } from '@/types/category';
import Button from '@/components/ui/button/Button';

interface ViewCategoriesModalProps {
  category: Category;
  onClose: () => void;
}

export default function ViewCategoriesModal({ category, onClose }: ViewCategoriesModalProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">View Category</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Name
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {category.name}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Short Description
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded whitespace-pre-wrap">
            {category.description || 'No description provided'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                category.status === 'active'
                  ? 'bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {category.status}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visibility type
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {category.visibility_type ?? 'FREE'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created At
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {new Date(category.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="primary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
