import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import WinningPatternsList from '@/components/winning-pattern/WinningPatternsList';

export const metadata: Metadata = {
  title: 'Winning Pattern Management | Admin',
  description: 'Manage winning patterns (name, slug, status)',
};

export default function WinningPatternPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Winning Pattern Management" />
      <div className="space-y-6">
        <ComponentCard title="Winning Patterns List">
          <WinningPatternsList />
        </ComponentCard>
      </div>
    </div>
  );
}
