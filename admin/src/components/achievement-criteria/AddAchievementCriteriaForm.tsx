'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { ROUTES } from '@/config/routes';
import { ChevronDownIcon } from '@/icons';

export default function AddAchievementCriteriaForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', status: 'active' });

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => setFormData((prev) => ({ ...prev, status: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!checkAuth()) {
      setError('Not authenticated. Please login again.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    const createUrl = API_ENDPOINTS.ACHIEVEMENT_CRITERIA.CREATE;
    if (!createUrl || String(createUrl).includes('undefined')) {
      setError('API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const payload = { name: formData.name.trim(), status: formData.status };
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        let message = 'Failed to create achievement criteria';
        try {
          const data = await response.json();
          if (data && typeof data.message === 'string') message = data.message;
          else if (data && Array.isArray(data.message)) message = data.message[0] || message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        setError(message);
        return;
      }
      showSuccessToast('Achievement criteria created successfully', 'Success');
      router.push(ROUTES.ACHIEVEMENT_CRITERIA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create achievement criteria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Add Achievement Criteria</h3>
        <Link href={ROUTES.ACHIEVEMENT_CRITERIA}>
          <Button type="button" size="sm" variant="outline">Back to list</Button>
        </Link>
      </div>
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required disabled={isSubmitting} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Slug will be auto-generated from name (unique).</p>
        </div>
        <div>
          <Label>Status</Label>
          <div className="relative">
            <Select options={statusOptions} placeholder="Select Status" onChange={handleStatusChange} defaultValue={formData.status} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        <Link href={ROUTES.ACHIEVEMENT_CRITERIA}><Button type="button" size="sm" variant="outline" disabled={isSubmitting}>Cancel</Button></Link>
        <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Achievement Criteria'}</Button>
      </div>
    </form>
  );
}
