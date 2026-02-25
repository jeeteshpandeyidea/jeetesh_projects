import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import GameTypesList from '@/components/game-types/GameTypesList';

export const metadata: Metadata = {
  title: 'Game Type Management | Vanue Admin',
  description: 'Manage game types and their details',
};

export default function GameTypePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Game Type Management" />
      <div className="space-y-6">
        <ComponentCard title="Game Types List">
          <GameTypesList />
        </ComponentCard>
      </div>
    </div>
  );
}
