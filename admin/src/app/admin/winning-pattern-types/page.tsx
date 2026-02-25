import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import WinningPatternTypesList from '@/components/winning-pattern-types/WinningPatternTypesList';

export const metadata: Metadata = {
  title: 'Winning Pattern Types | Admin',
  description: 'Manage winning pattern types',
};

export default function WinningPatternTypesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Winning Pattern Types" />
      <div className="space-y-6">
        <ComponentCard title="Winning Pattern Types List">
          <WinningPatternTypesList />
        </ComponentCard>
      </div>
    </div>
  );
}
