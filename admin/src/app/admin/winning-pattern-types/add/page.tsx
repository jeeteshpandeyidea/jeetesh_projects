import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddWinningPatternTypeForm from '@/components/winning-pattern-types/AddWinningPatternTypeForm';

export const metadata: Metadata = {
  title: 'Add Winning Pattern Type | Admin',
  description: 'Add a new winning pattern type',
};

export default function AddWinningPatternTypePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Winning Pattern Type" />
      <div className="space-y-6">
        <ComponentCard title="Add Winning Pattern Type">
          <AddWinningPatternTypeForm />
        </ComponentCard>
      </div>
    </div>
  );
}
