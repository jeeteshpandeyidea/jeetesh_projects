'use client';

import React, { useState, useEffect } from 'react';
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
import { WinningPatternType } from '@/types/winning-pattern-type';
import { ChevronDownIcon } from '@/icons';

function parseValidationError(body: { message?: string | string[]; errors?: Array<{ field: string; messages: string[] }> }): { fieldErrors: Record<string, string[]>; message: string } {
  const fieldErrors: Record<string, string[]> = {};
  let message = 'Validation failed';
  if (body.errors && Array.isArray(body.errors)) {
    body.errors.forEach((e) => { fieldErrors[e.field] = e.messages || []; });
    if (body.message && typeof body.message === 'string') message = body.message;
  } else if (body.message) {
    message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
  }
  return { fieldErrors, message };
}

function getPatternId(item: WinningPatternType): string {
  const ref = item.winning_pattern_id;
  if (typeof ref === 'object' && ref !== null && '_id' in ref) return (ref as { _id: string })._id;
  return typeof ref === 'string' ? ref : '';
}

function getPatternDisplayName(item: WinningPatternType): string {
  const ref = item.winning_pattern_id;
  if (typeof ref === 'object' && ref !== null && ref !== undefined) {
    const o = ref as { name?: string; slug?: string; _id?: string };
    return o.name || o.slug || o._id || '—';
  }
  return typeof ref === 'string' ? ref : '—';
}

export default function EditWinningPatternTypeForm({ item }: { item: WinningPatternType }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    winning_pattern_id: '',
    name: '',
    description: '',
    status: 'active',
  });

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
  const winningPatternDisplayName = getPatternDisplayName(item);

  useEffect(() => {
    setFormData({
      winning_pattern_id: getPatternId(item),
      name: item.name || '',
      description: item.description || '',
      status: item.status || 'active',
    });
  }, [item]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleStatusChange = (value: string) => setFormData((prev) => ({ ...prev, status: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    if (!checkAuth()) {
      setGeneralError('Not authenticated. Please login again.');
      return;
    }
    const nameTrim = formData.name.trim();
    if (!nameTrim) {
      setFieldErrors((prev) => ({ ...prev, name: ['Name is required'] }));
      return;
    }
    if (!formData.winning_pattern_id) {
      setFieldErrors((prev) => ({ ...prev, winning_pattern_id: ['Winning pattern is required'] }));
      return;
    }
    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
      const payload = {
        winning_pattern_id: formData.winning_pattern_id,
        name: nameTrim,
        description: formData.description.trim() || undefined,
        status: formData.status,
      };
      const response = await fetch(API_ENDPOINTS.WINNING_PATTERN_TYPES.UPDATE(item._id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setGeneralError('Unauthorized. Please login again.');
          return;
        }
        const data = await response.json().catch(() => ({}));
        const { fieldErrors: nextFieldErrors, message } = parseValidationError(data);
        setFieldErrors(nextFieldErrors);
        setGeneralError(message);
        return;
      }
      showSuccessToast('Winning pattern type updated successfully', 'Success');
      router.push(ROUTES.WINNING_PATTERN);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Winning Pattern Type</h3>
        <Link href={ROUTES.WINNING_PATTERN}>
          <Button type="button" size="sm" variant="outline">Back to list</Button>
        </Link>
      </div>
      {generalError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
        </div>
      )}
      <div className="space-y-4">
        <input type="hidden" name="winning_pattern_id" value={formData.winning_pattern_id} />
        <div>
          <Label htmlFor="winning_pattern_display">Winning Pattern</Label>
          <Input
            id="winning_pattern_display"
            name="winning_pattern_display"
            type="text"
            value={winningPatternDisplayName}
            readOnly
            className="bg-gray-100 dark:bg-white/5 cursor-default"
          />
        </div>
        <div>
          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="e.g. Line" required disabled={isSubmitting} error={!!(fieldErrors.name?.length)} />
          {fieldErrors.name?.length ? <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name.join(' ')}</p> : null}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" type="text" value={formData.description} onChange={handleInputChange} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Status</Label>
          <div className="relative">
            <Select options={statusOptions} placeholder="Select status" onChange={handleStatusChange} value={formData.status} className="dark:bg-dark-900" />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        <Link href={ROUTES.WINNING_PATTERN}><Button type="button" size="sm" variant="outline" disabled={isSubmitting}>Cancel</Button></Link>
        <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
