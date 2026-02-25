import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddGameForm from '@/components/games/AddGameForm';

export const metadata: Metadata = {
  title: 'Add Game | Admin',
  description: 'Create a new game',
};

export default function AddGamePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Game" />
      <div className="space-y-6">
        <ComponentCard title="Create Game">
          <AddGameForm />
        </ComponentCard>
      </div>
    </div>
  );
}
