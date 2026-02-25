import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddRewardForm from '@/components/rewards/AddRewardForm';

export const metadata: Metadata = {
  title: 'Add Reward | Admin',
  description: 'Create a new reward',
};

export default function AddRewardPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Reward" />
      <div className="space-y-6">
        <ComponentCard title="Create Reward">
          <AddRewardForm />
        </ComponentCard>
      </div>
    </div>
  );
}
