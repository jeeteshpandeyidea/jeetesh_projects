'use client';

import React from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/button/Button';

interface DeleteEligibilityConfirmProps {
  id: string;
  name?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteEligibilityConfirm({ id, name, onConfirm, onCancel }: DeleteEligibilityConfirmProps) {
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();

  const handleDelete = async () => {
    if (!checkAuth()) {
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch(API_ENDPOINTS.ELIGIBILITY.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete eligibility');

      showSuccessToast('Eligibility deleted', 'Success');
      onConfirm();
    } catch (err) {
      console.error(err);
      alert('Failed to delete eligibility');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Delete Eligibility</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-2 text-sm bg-error-500 text-white shadow-theme-xs hover:bg-error-600">Delete</button>
      </div>
    </div>
  );
}
