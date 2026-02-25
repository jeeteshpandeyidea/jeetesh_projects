'use client';

import React, { useState, useEffect } from 'react';
import { SubCategoryInput } from '@/types/subcategory';
import Button from '@/components/ui/button/Button';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/config/env';
import { useAuth } from '@/context/AuthContext';

interface AddSubCategoriesFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type Category = {
  _id: string;
  name: string;
};

export default function AddSubCategoriesForm({
  onSuccess,
  onCancel,
}: AddSubCategoriesFormProps) {
  const [formData, setFormData] = useState<SubCategoryInput>({
    name: '',
    category_id: '',
    description: '',
    status: 'active',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { checkAuth } = useAuth();

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const res = await fetch(`${API_URL.CLIENT}/categories/active`);
        const data = await res.json();

        // Optional sorting
        const sorted = data.sort((a: Category, b: Category) =>
          a.name.localeCompare(b.name)
        );

        setCategories(sorted);
      } catch (err) {
        console.error('Failed to load categories', err);
        showErrorToast('Failed to load categories');
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
      setError('Sub Category name is required');
      return;
    }

    if (!formData.category_id) {
      setError('Category is required');
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

      const response = await fetch(`${API_URL.CLIENT}/subcategories`, {
        method: 'POST',
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
          message: 'Failed to create sub category',
        }));

        throw new Error(errorData.message || 'Failed to create sub category');
      }

      showSuccessToast('Sub Category created successfully', 'Success');
      onSuccess();
    } catch (err) {
      console.error('Error creating sub category:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to create sub category';
      setError(message);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Add New Sub Category
      </h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* SubCategory Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SubCategory Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter sub category name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Category *
        </label>

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isCategoryLoading}
        >
          <option value="">
            {isCategoryLoading ? 'Loading categories...' : '-- Select Category --'}
          </option>

          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
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
      </div>

      {/* Status */}
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

      {/* Buttons */}
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
          {isLoading ? 'Creating...' : 'Create Sub Category'}
        </Button>
      </div>
    </form>
  );
}
