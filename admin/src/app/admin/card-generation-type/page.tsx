import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import CardGenerationsList from '@/components/card-generation/CardGenerationsList';

export const metadata: Metadata = {
  title: 'Card Generation Type | Admin',
  description: 'Manage card generation types',
};

export default function CardGenerationTypePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Card Generation Type" />
      <div className="space-y-6">
        <ComponentCard title="Card Generation Types List">
          <CardGenerationsList />
        </ComponentCard>
      </div>
    </div>
  );
}
