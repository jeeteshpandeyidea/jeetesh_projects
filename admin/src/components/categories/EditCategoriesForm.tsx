'use client';

import React, { useState } from 'react';
import { Category, CategoryInput } from '@/types/category';
import Button from '@/components/ui/button/Button';
import { useToast } from '@/context/ToastContext';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';

interface EditCategoriesFormProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditCategoriesForm({ category, onSuccess, onCancel }: EditCategoriesFormProps) {
  const [formData, setFormData] = useState<CategoryInput>({
    name: category.name,
    description: category.description || '',
    status: category.status,
    visibility_type: category.visibility_type ?? 'FREE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { checkAuth } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!checkAuth()) {
      showErrorToast('Not authenticated. Please login again.');
      return;
    }

    setIsLoading(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];

      const categoryId = (category as { _id?: string })._id ?? category.id;
      const response = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update category',
        }));
        throw new Error(errorData.message || 'Failed to update category');
      }

      showSuccessToast('Category updated successfully', 'Success');
      onSuccess();
    } catch (err) {
      console.error('Error updating category:', err);
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Category</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter category name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Short Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Enter a short description (optional)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Visibility type
        </label>
        <select
          name="visibility_type"
          value={formData.visibility_type ?? 'FREE'}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="FREE">FREE</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="ORG_ONLY">ORG_ONLY</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Updating...' : 'Update Category'}
        </Button>
      </div>
    </form>
  );
}
