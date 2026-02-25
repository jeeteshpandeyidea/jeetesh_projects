import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import AddEventForm from '@/components/events/AddEventForm';

export const metadata: Metadata = {
  title: 'Add Event | Admin',
  description: 'Create a new event',
};

export default function AddEventPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Event" />
      <div className="space-y-6">
        <ComponentCard title="Create Event">
          <AddEventForm />
        </ComponentCard>
      </div>
    </div>
  );
}
