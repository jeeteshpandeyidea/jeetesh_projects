import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddAchievementCriteriaForm from '@/components/achievement-criteria/AddAchievementCriteriaForm';

export const metadata: Metadata = {
  title: 'Add Achievement Criteria | Admin',
  description: 'Create a new achievement criteria',
};

export default function AddAchievementCriteriaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Achievement Criteria" />
      <div className="space-y-6">
        <ComponentCard title="Create Achievement Criteria">
          <AddAchievementCriteriaForm />
        </ComponentCard>
      </div>
    </div>
  );
}
