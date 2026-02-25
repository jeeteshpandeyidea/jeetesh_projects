'use client';

import React from 'react';
import { SubCategory } from '@/types/subcategory';
import Button from '@/components/ui/button/Button';

interface ViewSubCategoriesModalProps {
  subcategory: SubCategory;
  onClose: () => void;
}

export default function ViewSubCategoriesModal({ subcategory, onClose }: ViewSubCategoriesModalProps) {
  const categoryName = typeof subcategory.category_id === 'object' ? subcategory.category_id?.name : subcategory.category_id ?? '—';
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">View SubCategory</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Name
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {categoryName}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SubCategory Name
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {subcategory.name}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Short Description
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded whitespace-pre-wrap">
            {subcategory.description || 'No description provided'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subcategory.status === 'active'
                  ? 'bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {subcategory.status}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created At
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {new Date(subcategory.createdAt).toLocaleDateString('en-US', {
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
