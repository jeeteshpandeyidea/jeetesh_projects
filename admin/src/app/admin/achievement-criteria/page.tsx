import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AchievementCriteriaList from '@/components/achievement-criteria/AchievementCriteriaList';

export const metadata: Metadata = {
  title: 'Achievement Criteria Management | Admin',
  description: 'Manage achievement criteria (name, slug, status)',
};

export default function AchievementCriteriaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Achievement Criteria Management" />
      <div className="space-y-6">
        <ComponentCard title="Achievement Criteria List">
          <AchievementCriteriaList />
        </ComponentCard>
      </div>
    </div>
  );
}
