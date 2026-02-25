import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import GamesList from '@/components/games/GamesList';
import JoinByCodeForm from '@/components/games/JoinByCodeForm';

export const metadata: Metadata = {
  title: 'Games Management | Admin',
  description: 'Manage games, event, category, grid size, and game settings',
};

export default function GamesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Games Management" />
      <div className="space-y-6">
        <ComponentCard title="Join game by code">
          <JoinByCodeForm />
        </ComponentCard>
        <ComponentCard title="Games List">
          <GamesList />
        </ComponentCard>
      </div>
    </div>
  );
}
