import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddWinningPatternForm from '@/components/winning-pattern/AddWinningPatternForm';

export const metadata: Metadata = {
  title: 'Add Winning Pattern | Admin',
  description: 'Create a new winning pattern',
};

export default function AddWinningPatternPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Winning Pattern" />
      <div className="space-y-6">
        <ComponentCard title="Create Winning Pattern">
          <AddWinningPatternForm />
        </ComponentCard>
      </div>
    </div>
  );
}
