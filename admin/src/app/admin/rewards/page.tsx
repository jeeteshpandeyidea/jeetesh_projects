import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import RewardsList from '@/components/rewards/RewardsList';

export const metadata: Metadata = {
  title: 'Rewards Management | Admin',
  description: 'Manage rewards (name, slug, value, status)',
};

export default function RewardsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Rewards Management" />
      <div className="space-y-6">
        <ComponentCard title="Rewards List">
          <RewardsList />
        </ComponentCard>
      </div>
    </div>
  );
}
