'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, API_URL } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useSubCategories } from '@/hooks/useSubCategories';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';
import { Asset } from '@/types/asset';

interface EditAssetFormProps {
  asset: Asset;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const accessLevelOptions = [
  { value: 'FREE', label: 'FREE' },
  { value: 'PREMIUM', label: 'PREMIUM' },
  { value: 'ORG_ONLY', label: 'ORG_ONLY' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

function toId(ref: string | { _id: string } | undefined): string {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref._id ?? '';
}

export default function EditAssetForm({ asset, onSuccess, onCancel }: EditAssetFormProps) {
  const router = useRouter();
  const { categories } = useCategories();
  const { subcategories } = useSubCategories();
  const isPageMode = onSuccess === undefined && onCancel === undefined;
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    categoryId: '',
    subcategoryId: '',
    accessLevel: 'FREE',
    isPlaceholder: false,
    status: 'ACTIVE',
    sortOrder: 0,
    tagsStr: '',
  });

  useEffect(() => {
    setFormData({
      code: asset.code ?? '',
      title: asset.title ?? '',
      description: asset.description ?? '',
      imageUrl: asset.imageUrl ?? '',
      thumbnailUrl: asset.thumbnailUrl ?? '',
      categoryId: toId(asset.categoryId),
      subcategoryId: toId(asset.subcategoryId),
      accessLevel: asset.accessLevel ?? 'FREE',
      isPlaceholder: asset.isPlaceholder ?? false,
      status: asset.status ?? 'ACTIVE',
      sortOrder: asset.sortOrder ?? 0,
      tagsStr: Array.isArray(asset.tags) ? asset.tags.join(', ') : '',
    });
  }, [asset]);

  const categoryOptions = categories.map((c) => ({
    value: (c as { _id?: string })._id ?? (c as { id: string }).id,
    label: c.name,
  }));

  const getSubCategoryCategoryId = (s: { category_id?: string | { _id?: string } }) => {
    const cid = s.category_id;
    if (!cid) return '';
    return typeof cid === 'string' ? cid : cid._id ?? '';
  };
  const filteredSubcategories = formData.categoryId
    ? subcategories.filter((s) => getSubCategoryCategoryId(s) === formData.categoryId)
    : [];
  const subcategoryOptions = filteredSubcategories.map((s) => ({
    value: (s as { _id?: string })._id ?? (s as { id: string }).id,
    label: s.name,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = name === 'sortOrder' ? Number(value) || 0 : value;
    const isCheck = (e.target as HTMLInputElement).type === 'checkbox';
    setFormData((prev) => ({ ...prev, [name]: isCheck ? (e.target as HTMLInputElement).checked : next }));
  };

  const handleSelect = (name: string) => (value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'categoryId') next.subcategoryId = '';
      return next;
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (!checkAuth()) {
      showErrorToast('Not authenticated.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const form = new FormData();
      form.append('image', file);
      const response = await fetch(API_ENDPOINTS.ASSETS.UPLOAD, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errData.message || 'Upload failed');
      }
      const data = await response.json();
      const path = data?.path ?? '';
      if (path) setFormData((prev) => ({ ...prev, imageUrl: path }));
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!checkAuth()) {
      setError('Not authenticated. Please login again.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setError('Image URL is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Category is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const tags = formData.tagsStr ? formData.tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        accessLevel: formData.accessLevel,
        isPlaceholder: formData.isPlaceholder,
        status: formData.status,
        sortOrder: formData.sortOrder,
        tags,
      };
      const response = await fetch(API_ENDPOINTS.ASSETS.UPDATE(asset._id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errData = await response.json().catch(() => ({ message: 'Failed to update asset' }));
        throw new Error(errData.message || 'Failed to update asset');
      }
      showSuccessToast('Asset updated successfully', 'Success');
      if (isPageMode) router.push(ROUTES.ASSETS);
      else onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Asset</h3>
        {isPageMode && (
          <Link href={ROUTES.ASSETS}>
            <Button type="button" size="sm" variant="outline">Back to list</Button>
          </Link>
        )}
      </div>
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" type="text" value={formData.code} readOnly disabled className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} placeholder="e.g. Krishna, Number 7" required disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" type="text" value={formData.description} onChange={handleInputChange} placeholder="Optional" disabled={isSubmitting} />
        </div>
        <div>
          <Label>Category <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select options={[{ value: '', label: 'Select category' }, ...categoryOptions]} placeholder="Select category" onChange={handleSelect('categoryId')} value={formData.categoryId} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
        <div>
          <Label>Subcategory</Label>
          <div className="relative" key={formData.categoryId || 'no-cat'}>
            <Select options={[{ value: '', label: formData.categoryId ? 'Select subcategory (optional)' : 'Select category first' }, ...subcategoryOptions]} placeholder="Subcategory" onChange={handleSelect('subcategoryId')} value={formData.subcategoryId} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
        <div>
          <Label htmlFor="imageFile">Image file</Label>
          <input id="imageFile" type="file" accept="image/*" onChange={handleImageFileChange} disabled={isSubmitting || isUploading} className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 dark:file:bg-white/10 dark:file:text-gray-300 file:cursor-pointer cursor-pointer border border-gray-300 dark:border-white/10 rounded-lg" />
          {isUploading && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uploading…</p>}
          {formData.imageUrl && (
            <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={formData.imageUrl.startsWith('assets/') ? `${API_URL.CLIENT}/${formData.imageUrl}` : formData.imageUrl} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL <span className="text-red-500">*</span></Label>
          <Input id="imageUrl" name="imageUrl" type="text" value={formData.imageUrl} onChange={handleInputChange} placeholder="Or paste URL / path" required disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" type="text" value={formData.thumbnailUrl} onChange={handleInputChange} placeholder="Optional" disabled={isSubmitting} />
        </div>
        <div>
          <Label>Access Level</Label>
          <div className="relative">
            <Select options={accessLevelOptions} placeholder="Access Level" onChange={handleSelect('accessLevel')} value={formData.accessLevel} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <div className="relative">
            <Select options={statusOptions} placeholder="Status" onChange={handleSelect('status')} value={formData.status} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" value={formData.sortOrder} onChange={handleInputChange} disabled={isSubmitting} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPlaceholder" name="isPlaceholder" checked={formData.isPlaceholder} onChange={handleInputChange} disabled={isSubmitting} className="rounded border-gray-300 dark:border-white/10" />
            <Label htmlFor="isPlaceholder">Use as custom square placeholder</Label>
          </div>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="tagsStr">Tags (comma-separated)</Label>
          <Input id="tagsStr" name="tagsStr" type="text" value={formData.tagsStr} onChange={handleInputChange} placeholder="e.g. krishna, motivation" disabled={isSubmitting} />
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        {isPageMode ? (
          <Link href={ROUTES.ASSETS}><Button type="button" size="sm" variant="outline" disabled={isSubmitting}>Cancel</Button></Link>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
