import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddAssetForm from '@/components/assets/AddAssetForm';

export const metadata: Metadata = {
  title: 'Add Asset | Admin',
  description: 'Create a new asset',
};

export default function AddAssetPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Asset" />
      <div className="space-y-6">
        <ComponentCard title="Create Asset">
          <AddAssetForm />
        </ComponentCard>
      </div>
    </div>
  );
}
