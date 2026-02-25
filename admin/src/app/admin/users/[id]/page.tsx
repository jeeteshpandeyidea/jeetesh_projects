'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { User } from '@/types/user';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';

function getRoleName(role: { name?: string } | string): string {
  if (typeof role === 'string') return role;
  return role?.name ?? '—';
}

export default function UserDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return null;
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];
    const res = await fetch(API_ENDPOINTS.USERS.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load user');
    return res.json() as Promise<User>;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchUser()
      .then((data) => setUser(data ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [id, fetchUser]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User Details" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading user...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User Details" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'User not found'}</p>
          <Link href={ROUTES.USERS} className="mt-2 inline-block text-sm text-brand-600 hover:underline">
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        <ComponentCard title="User Details">
          <div className="flex items-center justify-end gap-2 mb-4">
            <Link href={ROUTES.USERS}>
              <Button type="button" size="sm" variant="outline">
                Back to list
              </Button>
            </Link>
            <Link href={ROUTES.USERS_EDIT(user._id)}>
              <Button type="button" size="sm">
                Edit user
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Full Name
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">{user.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Email
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">{user.email}</p>
              {user.emailVerified && (
                <span className="inline-flex items-center mt-1 text-xs text-success-600 dark:text-success-400">
                  Verified
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Username
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Phone
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">{user.phone || '—'}</p>
              {user.phoneVerified && (
                <span className="inline-flex items-center mt-1 text-xs text-success-600 dark:text-success-400">
                  Verified
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active'
                    ? 'bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400'
                    : user.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    : 'bg-error-100 text-error-800 dark:bg-error-500/20 dark:text-error-400'
                }`}
              >
                {user.status}
              </span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {getRoleName(role)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Created At
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Last Updated
              </label>
              <p className="text-sm text-gray-800 dark:text-white/90">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
