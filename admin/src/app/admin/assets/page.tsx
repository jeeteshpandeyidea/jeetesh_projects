import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AssetsList from '@/components/assets/AssetsList';

export const metadata: Metadata = {
  title: 'Assets Management | Vanue Admin',
  description: 'Manage assets (images, placeholders, categories)',
};

export default function AssetsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Assets Management" />
      <div className="space-y-6">
        <ComponentCard title="Assets List">
          <AssetsList />
        </ComponentCard>
      </div>
    </div>
  );
}
