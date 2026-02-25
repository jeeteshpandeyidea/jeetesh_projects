'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddUserForm from '@/components/users/AddUserForm';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

export default function AddUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.USERS);
  };

  const handleCancel = () => {
    router.push(ROUTES.USERS);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add New User" />
      <div className="space-y-6">
        <ComponentCard title="Add New User">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new user. Email and phone must be unique.
            </p>
            <Link href={ROUTES.USERS}>
              <Button type="button" size="sm" variant="outline">
                Back to list
              </Button>
            </Link>
          </div>
          <AddUserForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </ComponentCard>
      </div>
    </div>
  );
}
