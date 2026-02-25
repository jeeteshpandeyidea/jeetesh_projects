'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import EditUserForm from '@/components/users/EditUserForm';
import { API_ENDPOINTS } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { User } from '@/types/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleSuccess = () => {
    router.push(ROUTES.USERS);
  };

  const handleCancel = () => {
    router.push(ROUTES.USERS);
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit User" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading user...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit User" />
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
      <PageBreadcrumb pageTitle="Edit User" />
      <div className="space-y-6">
        <ComponentCard title="Edit User">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update user details. Email and phone must be unique.
            </p>
            <Link href={ROUTES.USERS_VIEW(id)}>
              <Button type="button" size="sm" variant="outline">
                Back to details
              </Button>
            </Link>
          </div>
          <EditUserForm user={user} onSuccess={handleSuccess} onCancel={handleCancel} />
        </ComponentCard>
      </div>
    </div>
  );
}
