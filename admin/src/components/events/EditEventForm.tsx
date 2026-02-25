'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEventTypes } from '@/hooks/useEventTypes';
import { useCategories } from '@/hooks/useCategories';
import { useEligibility } from '@/hooks/useEligibility';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useRewards } from '@/hooks/useRewards';
import { useWinningPatterns } from '@/hooks/useWinningPatterns';
import DatePicker from '@/components/form/date-picker';
import TextArea from '@/components/form/input/TextArea';
import { Event } from '@/types/event';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { ROUTES } from '@/config/routes';
import { ChevronDownIcon } from '@/icons';

interface EditEventFormProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditEventForm({ event, onSuccess, onCancel }: EditEventFormProps) {
  const router = useRouter();
  const { eventTypes } = useEventTypes();
  const { categories } = useCategories();
  const { eligibilities } = useEligibility();
  const { gameTypes } = useGameTypes();
  const { rewards } = useRewards();
  const { winningPatterns } = useWinningPatterns();

  const rewardId = typeof event.reward_id === 'object' && event.reward_id ? event.reward_id._id : (event.reward_id ?? '');
  const categoryId = typeof event.category_id === 'object' && event.category_id ? event.category_id._id : (event.category_id ?? '');
  const eventTypeId = typeof event.event_type_id === 'object' && event.event_type_id ? event.event_type_id._id : (event.event_type_id ?? '');
  const eligibilityId = typeof event.eligibility_id === 'object' && event.eligibility_id ? event.eligibility_id._id : (event.eligibility_id ?? '');
  const gameTypeId = typeof event.game_type_id === 'object' && event.game_type_id ? event.game_type_id._id : (event.game_type_id ?? '');

  const parseWinningCondition = (wc: string | undefined, patterns: { _id: string; name: string }[]) => {
    if (!wc) return { winning_pattern_id: '', winning_condition_extra: '' };
    const idx = wc.indexOf(' - ');
    if (idx === -1) return { winning_pattern_id: '', winning_condition_extra: wc };
    const first = wc.slice(0, idx).trim();
    const extra = wc.slice(idx + 3).trim();
    const pattern = patterns.find((p) => p.name === first);
    return { winning_pattern_id: pattern?._id ?? '', winning_condition_extra: extra };
  };

  const initialWinning = parseWinningCondition(event.winning_condition, winningPatterns);

  const [formData, setFormData] = useState({
    name: event.name || '',
    category_id: categoryId,
    event_type_id: eventTypeId,
    eligibility_id: eligibilityId,
    winning_pattern_id: initialWinning.winning_pattern_id,
    winning_condition_extra: initialWinning.winning_condition_extra,
    game_type_id: gameTypeId,
    start_date: event.start_date || '',
    end_date: event.end_date || '',
    max_participants: event.max_participants || 0,
    reward_id: rewardId,
    rewards_value: event.rewards_value ?? (rewards.find((r) => r._id === rewardId)?.value ?? 0),
    distribution: event.distribution || '',
    description: event.description || '',
    status: event.status || 'active',
  });

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();

  useEffect(() => {
    const rId = typeof event.reward_id === 'object' && event.reward_id ? event.reward_id._id : (event.reward_id ?? '');
    const cId = typeof event.category_id === 'object' && event.category_id ? event.category_id._id : (event.category_id ?? '');
    const etId = typeof event.event_type_id === 'object' && event.event_type_id ? event.event_type_id._id : (event.event_type_id ?? '');
    const elId = typeof event.eligibility_id === 'object' && event.eligibility_id ? event.eligibility_id._id : (event.eligibility_id ?? '');
    const gId = typeof event.game_type_id === 'object' && event.game_type_id ? event.game_type_id._id : (event.game_type_id ?? '');
    const win = parseWinningCondition(event.winning_condition, winningPatterns);
    const reward = rewards.find((r) => r._id === rId);
    setFormData({
      name: event.name || '',
      category_id: cId,
      event_type_id: etId,
      eligibility_id: elId,
      winning_pattern_id: win.winning_pattern_id,
      winning_condition_extra: win.winning_condition_extra,
      game_type_id: gId,
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      max_participants: event.max_participants || 0,
      reward_id: rId,
      rewards_value: event.rewards_value ?? reward?.value ?? 0,
      distribution: event.distribution || '',
      description: event.description || '',
      status: event.status || 'active',
    });
  }, [event, winningPatterns, rewards]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === '' ? 0 : Number(value);
    setFormData((prev) => ({
      ...prev,
      [name]: num,
    }));
  };

  const handleEventTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      event_type_id: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
  };

  const handleEligibilityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      eligibility_id: value,
    }));
  };

  const handleGameTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      game_type_id: value,
    }));
  };

  const handleRewardChange = (value: string) => {
    const reward = rewards.find((r) => r._id === value);
    setFormData((prev) => ({
      ...prev,
      reward_id: value,
      rewards_value: reward?.value ?? 0,
    }));
  };

  const handleWinningPatternChange = (value: string) => {
    setFormData((prev) => ({ ...prev, winning_pattern_id: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleStartDateChange = (dates: Date[], dateStr: string) => {
    setFormData((prev) => ({ ...prev, start_date: dateStr }));
  };

  const handleEndDateChange = (dates: Date[], dateStr: string) => {
    setFormData((prev) => ({ ...prev, end_date: dateStr }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const eventTypeOptions = eventTypes.map((eventType) => ({
    value: eventType._id,
    label: eventType.name,
  }));

  const categoryOptions = categories.map((c) => ({ value: '_id' in c ? (c as { _id: string })._id : c.id, label: c.name }));
  const eligibilityOptions = eligibilities.map((e) => ({ value: e._id, label: e.name }));
  const gameTypeOptions = gameTypes.map((g) => ({ value: g._id, label: g.name }));
  const rewardOptions = rewards.map((r) => ({ value: r._id, label: r.name }));
  const winningPatternOptions = winningPatterns.map((wp) => ({ value: wp._id, label: wp.name }));

  const selectedPatternName = formData.winning_pattern_id
    ? winningPatterns.find((wp) => wp._id === formData.winning_pattern_id)?.name ?? ''
    : '';
  const winningConditionPayload =
    selectedPatternName && formData.winning_condition_extra
      ? `${selectedPatternName} - ${formData.winning_condition_extra}`
      : selectedPatternName || formData.winning_condition_extra || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!checkAuth()) {
      setError('Not authenticated. Please login again.');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.event_type_id.trim()) {
      setError('Event type is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get auth token from cookie
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];

      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        event_type_id: formData.event_type_id.trim(),
        status: formData.status,
      };
      if (formData.category_id) payload.category_id = formData.category_id;
      if (formData.eligibility_id) payload.eligibility_id = formData.eligibility_id;
      if (winningConditionPayload) payload.winning_condition = winningConditionPayload.trim();
      if (formData.description) payload.description = formData.description.trim();
      if (formData.game_type_id) payload.game_type_id = formData.game_type_id;
      if (formData.start_date) payload.start_date = new Date(formData.start_date).toISOString();
      if (formData.end_date) payload.end_date = new Date(formData.end_date).toISOString();
      if (formData.max_participants) payload.max_participants = Number(formData.max_participants);
      if (formData.reward_id) payload.reward_id = formData.reward_id;
      if (formData.rewards_value) payload.rewards_value = Number(formData.rewards_value);
      if (formData.distribution) payload.distribution = formData.distribution;

      const response = await fetch(API_ENDPOINTS.EVENTS.UPDATE(event._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update event',
        }));
        throw new Error(errorData.message || 'Failed to update event');
      }

      showSuccessToast('Event updated successfully', 'Success');
      if (onSuccess) onSuccess(); else router.push(ROUTES.EVENTS);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Event</h3>
        <Link href={ROUTES.EVENTS}><Button type="button" size="sm" variant="outline">Back to list</Button></Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter event name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="event_type_id">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select
                options={eventTypeOptions}
                placeholder="Select Event Type"
                onChange={handleEventTypeChange}
                defaultValue={formData.event_type_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="category_id">Category</Label>
            <div className="relative">
              <Select
                options={categoryOptions}
                placeholder="Select Category"
                onChange={handleCategoryChange}
                defaultValue={formData.category_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="eligibility_id">Eligibility</Label>
            <div className="relative">
              <Select
                options={eligibilityOptions}
                placeholder="Select Eligibility"
                onChange={handleEligibilityChange}
                defaultValue={formData.eligibility_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="game_type_id">Game Type</Label>
            <div className="relative">
              <Select
                options={gameTypeOptions}
                placeholder="Select Game Type"
                onChange={handleGameTypeChange}
                defaultValue={formData.game_type_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <DatePicker
              id="edit-start-date"
              placeholder="Select start date"
              onChange={handleStartDateChange}
              defaultDate={formData.start_date || undefined}
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <DatePicker
              id="edit-end-date"
              placeholder="Select end date"
              onChange={handleEndDateChange}
              defaultDate={formData.end_date || undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="reward_id">Reward</Label>
            <div className="relative">
              <Select
                options={[{ value: '', label: 'Select Reward' }, ...rewardOptions]}
                placeholder="Select Reward"
                onChange={handleRewardChange}
                defaultValue={formData.reward_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
            </div>
          </div>
          <div>
            <Label htmlFor="rewards_value">Rewards Value</Label>
            <Input
              id="rewards_value"
              name="rewards_value"
              type="text"
              value={String(formData.rewards_value)}
              disabled
              className="bg-gray-100 dark:bg-dark-800 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <TextArea
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter event description"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="winning_pattern_id">Winning Condition (Pattern)</Label>
            <div className="relative">
              <Select
                options={[{ value: '', label: 'Select Winning Pattern' }, ...winningPatternOptions]}
                placeholder="Select Winning Pattern"
                onChange={handleWinningPatternChange}
                defaultValue={formData.winning_pattern_id}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
            </div>
          </div>
          <div>
            <Label htmlFor="winning_condition_extra">Additional Winning Condition</Label>
            <Input
              id="winning_condition_extra"
              name="winning_condition_extra"
              type="text"
              value={formData.winning_condition_extra}
              onChange={handleInputChange}
              placeholder="e.g. First to complete 5 rounds"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="max_participants">Max Participants</Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              value={String(formData.max_participants)}
              onChange={handleNumberChange}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="distribution">Distribution</Label>
          <Input
            id="distribution"
            name="distribution"
            type="text"
            value={formData.distribution}
            onChange={handleInputChange}
            placeholder="e.g. top-3"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <div className="relative">
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={handleStatusChange}
              defaultValue={formData.status}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        {onCancel ? (
          <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        ) : (
          <Link href={ROUTES.EVENTS}><Button type="button" size="sm" variant="outline" disabled={isSubmitting}>Cancel</Button></Link>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Event'}</Button>
      </div>
    </form>
  );
}
