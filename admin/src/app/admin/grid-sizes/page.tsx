import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import GridSizesList from '@/components/grid-sizes/GridSizesList';

export const metadata: Metadata = {
  title: 'Grid Sizes Management | Vanue Admin',
  description: 'Manage grid sizes and their details',
};

export default function GridSizesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Grid Sizes Management" />
      <div className="space-y-6">
        <ComponentCard title="Grid Sizes List">
          <GridSizesList />
        </ComponentCard>
      </div>
    </div>
  );
}
