"use client";

import React, { useMemo, useState } from 'react';
import { useEligibility } from '@/hooks/useEligibility';
import EligibilityTable from '@/components/eligibility/EligibilityTable';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from '@/icons';
import { Modal } from '@/components/ui/modal';
import AddEligibilityForm from '@/components/eligibility/AddEligibilityForm';
import EditEligibilityForm from '@/components/eligibility/EditEligibilityForm';
import DeleteEligibilityConfirm from '@/components/eligibility/DeleteEligibilityConfirm';

export default function Page() {
  const { eligibilities, isLoading, refetch } = useEligibility();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selected, setSelected] = useState<any | null>(null);

  const openAdd = () => {
    setMode('add');
    setSelected(null);
    setOpenDrawer(true);
  };

  const openEdit = (row: any) => {
    setMode('edit');
    setSelected(row);
    setOpenDrawer(true);
  };

  const openDelete = (row: any) => {
    setMode('delete');
    setSelected(row);
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
    setSelected(null);
  };

  const handleSuccess = async () => {
    await refetch();
    closeDrawer();
  };

  const memoData = useMemo(() => eligibilities || [], [eligibilities]);

  return (
    <div className="py-6 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Eligibility</h2>
        <Button size="sm" className="flex items-center justify-center w-9 h-9 p-0" onClick={openAdd} title="Add Form">
        <PlusIcon className="w-4 h-4" />
      </Button>
      </div>

      <EligibilityTable data={memoData} isLoading={isLoading} onEdit={openEdit} onDelete={openDelete} />

      <Modal isOpen={openDrawer} onClose={closeDrawer} className="max-w-[600px] p-5 lg:p-10">
        {mode === 'add' && <AddEligibilityForm onSuccess={handleSuccess} onCancel={closeDrawer} />}
        {mode === 'edit' && selected && <EditEligibilityForm id={selected._id} initial={selected} onSuccess={handleSuccess} onCancel={closeDrawer} />}
        {mode === 'delete' && selected && <DeleteEligibilityConfirm id={selected._id} name={selected.name} onConfirm={handleSuccess} onCancel={closeDrawer} />}
      </Modal>
    </div>
  );
}
