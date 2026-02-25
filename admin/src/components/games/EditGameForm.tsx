'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { useGridSizes } from '@/hooks/useGridSizes';
import { useCardGenerations } from '@/hooks/useCardGenerations';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useWinningPatterns } from '@/hooks/useWinningPatterns';
import { useWinningPatternTypes } from '@/hooks/useWinningPatternTypes';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import DatePicker from '@/components/form/date-picker';
import Select from '@/components/form/Select';
import { ROUTES } from '@/config/routes';
import { Game } from '@/types/game';
import { ChevronDownIcon } from '@/icons';

function refId(ref: string | { _id: string } | undefined): string {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref._id ?? '';
}

interface EditGameFormProps {
  game: Game;
}

export default function EditGameForm({ game }: EditGameFormProps) {
  const router = useRouter();
  const params = useParams();
  const { events } = useEvents();
  const { categories } = useCategories();
  const { gridSizes } = useGridSizes();
  const { cardGenerations } = useCardGenerations();
  const { gameTypes } = useGameTypes();
  const { winningPatterns } = useWinningPatterns();

  const [formData, setFormData] = useState({
    name: '',
    event_id: '',
    category_id: '',
    grid_size_id: '',
    card_gen_id: '',
    game_type_id: '',
    winning_patt_id: '',
    winning_pattern_type_id: '',
    access_control: false,
    max_player: '',
    game_start_date: '',
    description: '',
    status: 'DRAFT',
    game_mode: 'STANDARD',
  });

  const { winningPatternTypes } = useWinningPatternTypes();
  const winningPatternTypesByPatternId = React.useMemo(() => {
    const map: Record<string, { value: string; label: string }[]> = {};
    (winningPatternTypes ?? []).forEach((t) => {
      const pid = typeof t.winning_pattern_id === 'string' ? t.winning_pattern_id : (t.winning_pattern_id as { _id?: string })?._id ?? '';
      if (pid) {
        if (!map[pid]) map[pid] = [];
        map[pid].push({ value: t._id, label: t.name || t.slug || t._id });
      }
    });
    return map;
  }, [winningPatternTypes]);
  const winningPatternTypeOptions = formData.winning_patt_id ? (winningPatternTypesByPatternId[formData.winning_patt_id] ?? []) : [];

  useEffect(() => {
    const startDate = game.game_start_date
      ? new Date(game.game_start_date).toISOString().slice(0, 10)
      : '';
    setFormData({
      name: game.name ?? '',
      event_id: refId(game.event_id),
      category_id: refId(game.category_id),
      grid_size_id: refId(game.grid_size_id),
      card_gen_id: refId(game.card_gen_id),
      game_type_id: refId(game.game_type_id),
      winning_patt_id: refId(game.winning_patt_id),
      winning_pattern_type_id: refId((game as { winning_pattern_type_id?: string | { _id: string } }).winning_pattern_type_id),
      access_control: game.access_control ?? false,
      max_player: game.max_player != null ? String(game.max_player) : '',
      game_start_date: startDate,
      description: game.description ?? '',
      status: game.status ?? 'DRAFT',
      game_mode: game.game_mode ?? 'STANDARD',
    });
  }, [game]);

  const statusOptions = [
    { value: 'DRAFT', label: 'DRAFT' },
    { value: 'SCHEDULED', label: 'SCHEDULED' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'COMPLETED', label: 'COMPLETED' },
  ];
  const accessOptions = [
    { value: 'false', label: 'Open' },
    { value: 'true', label: 'Closed' },
  ];
  const gameModeOptions = [
    { value: 'STANDARD', label: 'Standard (first winner ends)' },
    { value: 'ELIMINATION', label: 'Elimination (until 1 left)' },
  ];

  const eventOptions = events.map((e) => ({ value: e._id, label: e.name }));
  const categoryOptions = categories.map((c) => ({
    value: (c as { _id?: string })._id ?? (c as { id: string }).id,
    label: c.name,
  }));
  const gridSizeOptions = gridSizes.map((g) => ({ value: g._id, label: g.name }));
  const cardGenOptions = cardGenerations.map((c) => ({ value: c._id, label: c.name }));
  const gameTypeOptions = gameTypes.map((g) => ({ value: g._id, label: g.name }));
  const winningPatternOptions = winningPatterns.map((w) => ({ value: w._id, label: w.name }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();
  const { success: showSuccessToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: string) => (value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'winning_patt_id') next.winning_pattern_type_id = '';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const id = params?.id as string;
    if (!id || !checkAuth()) {
      setError(id ? 'Not authenticated.' : 'Invalid game id.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Game name is required');
      return;
    }
    if (!formData.event_id.trim()) {
      setError('Event is required');
      return;
    }
    if (!formData.category_id?.trim()) {
      setError('Category is required');
      return;
    }
    if (!formData.grid_size_id?.trim()) {
      setError('Grid Size is required');
      return;
    }
    if (!formData.card_gen_id?.trim()) {
      setError('Card Generation Type is required');
      return;
    }
    if (!formData.game_type_id?.trim()) {
      setError('Game Type is required');
      return;
    }
    if (!formData.winning_patt_id?.trim()) {
      setError('Winning Pattern is required');
      return;
    }
    if (!formData.winning_pattern_type_id?.trim()) {
      setError('Winning Pattern Type is required');
      return;
    }
    if (!formData.max_player?.trim()) {
      setError('Max Player is required');
      return;
    }
    const maxPlayerNum = Number(formData.max_player);
    if (Number.isNaN(maxPlayerNum) || maxPlayerNum < 1) {
      setError('Max Player must be at least 1');
      return;
    }
    if (!formData.game_start_date?.trim()) {
      setError('Game Start Date is required');
      return;
    }
    if (!formData.description?.trim()) {
      setError('Description is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='))
        ?.split('=')[1];
      const payload = {
        name: formData.name.trim(),
        event_id: formData.event_id,
        category_id: formData.category_id || undefined,
        grid_size_id: formData.grid_size_id || undefined,
        card_gen_id: formData.card_gen_id || undefined,
        game_type_id: formData.game_type_id || undefined,
        winning_patt_id: formData.winning_patt_id || undefined,
        winning_pattern_type_id: formData.winning_pattern_type_id || undefined,
        access_control: formData.access_control,
        max_player: formData.max_player ? Number(formData.max_player) : undefined,
        game_start_date: formData.game_start_date
          ? `${formData.game_start_date}T00:00:00.000Z`
          : undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        game_mode: formData.game_mode || 'STANDARD',
      };
      const response = await fetch(API_ENDPOINTS.GAMES.UPDATE(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Bypass': 'true',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          return;
        }
        const err = await response.json().catch(() => ({ message: 'Failed to update game' }));
        throw new Error(err.message || 'Failed to update game');
      }
      showSuccessToast('Game updated successfully', 'Success');
      router.push(ROUTES.GAMES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Game</h3>
        <Link href={ROUTES.GAMES}>
          <Button type="button" size="sm" variant="outline">
            Back to list
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Game name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Weekend Bingo" disabled={isSubmitting} required />
        </div>
        <div>
          <Label>Event <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Event' }, ...eventOptions]}
              placeholder="Select Event"
              onChange={handleSelect('event_id')}
              defaultValue={formData.event_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Category <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Category' }, ...categoryOptions]}
              placeholder="Select Category"
              onChange={handleSelect('category_id')}
              defaultValue={formData.category_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Grid Size</Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Grid Size' }, ...gridSizeOptions]}
              placeholder="Select Grid Size"
              onChange={handleSelect('grid_size_id')}
              defaultValue={formData.grid_size_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Card Generation Type <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Card Gen Type' }, ...cardGenOptions]}
              placeholder="Select Card Gen Type"
              onChange={handleSelect('card_gen_id')}
              defaultValue={formData.card_gen_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Game Type <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Game Type' }, ...gameTypeOptions]}
              placeholder="Select Game Type"
              onChange={handleSelect('game_type_id')}
              defaultValue={formData.game_type_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Winning Pattern <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: 'Select Winning Pattern' }, ...winningPatternOptions]}
              placeholder="Select Winning Pattern"
              onChange={handleSelect('winning_patt_id')}
              defaultValue={formData.winning_patt_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Winning Pattern Type <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={[{ value: '', label: formData.winning_patt_id ? 'Select Winning Pattern Type' : 'Select Winning Pattern first' }, ...winningPatternTypeOptions]}
              placeholder={formData.winning_patt_id ? 'Select Winning Pattern Type' : 'Select Winning Pattern first'}
              onChange={handleSelect('winning_pattern_type_id')}
              value={formData.winning_pattern_type_id}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Access Control <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={accessOptions}
              placeholder="Open/Closed"
              onChange={(v) => setFormData((p) => ({ ...p, access_control: v === 'true' }))}
              defaultValue={String(formData.access_control)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label htmlFor="max_player">Max Player <span className="text-red-500">*</span></Label>
          <Input
            id="max_player"
            name="max_player"
            type="number"
            min="1"
            required
            value={formData.max_player}
            onChange={handleInputChange}
            placeholder="e.g. 10"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label>Game mode</Label>
          <div className="relative">
            <Select
              options={gameModeOptions}
              placeholder="Standard / Elimination"
              onChange={handleSelect('game_mode')}
              defaultValue={formData.game_mode}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label htmlFor="game_start_date">Game Start Date <span className="text-red-500">*</span></Label>
          <DatePicker
            id="game_start_date_edit"
            placeholder="Select start date"
            defaultDate={formData.game_start_date || undefined}
            onChange={(_, dateStr) => setFormData((p) => ({ ...p, game_start_date: dateStr || '' }))}
          />
        </div>
        <div>
          <Label>Status <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Select
              options={statusOptions}
              placeholder="Status"
              onChange={handleSelect('status')}
              value={formData.status}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <textarea id="description" name="description" rows={3} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Game description" disabled={isSubmitting} className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 focus:outline-none focus:ring-3 focus:ring-brand-500/10 min-h-[80px]" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
        <Link href={ROUTES.GAMES}>
          <Button type="button" size="sm" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
