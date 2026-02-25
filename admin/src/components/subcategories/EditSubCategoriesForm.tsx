'use client';

import React, { useEffect, useState } from 'react';
import { SubCategory, SubCategoryInput } from '@/types/subcategory';
import Button from '@/components/ui/button/Button';
import { useToast } from '@/context/ToastContext';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id: string;
  name: string;
}

interface EditSubCategoriesFormProps {
  subcategory: SubCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditSubCategoriesForm({
  subcategory,
  onSuccess,
  onCancel,
}: EditSubCategoriesFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<SubCategoryInput>({
    name: subcategory?.name,
    category_id:
      typeof subcategory?.category_id === 'object'
        ? subcategory.category_id._id
        : subcategory?.category_id,
    description: subcategory?.description || '',
    status: subcategory?.status,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { checkAuth } = useAuth();

  // ✅ Fetch Active Categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const response = await fetch(
          'http://localhost:3000/categories/active'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Category fetch error:', err);
        showErrorToast('Failed to load categories');
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [showErrorToast]);

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
      setError('SubCategory name is required');
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

      const response = await fetch(
        API_ENDPOINTS.SUBCATEGORIES.UPDATE(subcategory.id),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update subcategory',
        }));
        throw new Error(errorData.message);
      }

      showSuccessToast('SubCategory updated successfully', 'Success');
      onSuccess();
    } catch (err) {
      console.error('Error updating subcategory:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update subcategory';
      setError(message);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Edit SubCategory
      </h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* SubCategory Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          SubCategory Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isLoading}
        />
      </div>

      {/* ✅ Category Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Category *
        </label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isLoading || isCategoryLoading}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isLoading}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
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
          {isLoading ? 'Updating...' : 'Update SubCategory'}
        </Button>
      </div>
    </form>
  );
}
