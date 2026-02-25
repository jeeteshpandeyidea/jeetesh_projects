'use client';

import React, { useState } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRoles } from '@/hooks/useRoles';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    roles: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();
  const { roles } = useRoles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!checkAuth()) {
      setError('Not authenticated. Please login again.');
      return;
    }

    if (!formData.email.trim() || !formData.username.trim() || !formData.fullName.trim()) {
      setError('Email, username, and full name are required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];

      const payload = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        roles: formData.roles,
      };

      const response = await fetch(API_ENDPOINTS.USERS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create user',
        }));
        throw new Error(errorData.message || 'Failed to create user');
      }

      showSuccessToast('User created successfully', 'Success');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="e.g., John Doe"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="e.g., user@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            type="text"
            id="username"
            name="username"
            placeholder="e.g., john_doe"
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            type="text"
            id="phone"
            name="phone"
            placeholder="e.g., +1-555-1234567"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs text-gray-800 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Roles</Label>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-gray-300 rounded-lg p-3 dark:border-gray-700">
          {roles.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No roles available</p>
          ) : (
            roles.map((role) => (
              <label
                key={role._id}
                className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role._id)}
                  onChange={() => handleRoleChange(role._id)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
