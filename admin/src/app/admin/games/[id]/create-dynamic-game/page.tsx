'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { API_ENDPOINTS, API_URL } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/context/ToastContext';
import { Game } from '@/types/game';
import { GameCard as GameCardType } from '@/types/game-card';

/** Inline 1x1 grey PNG – no network request, avoids 404 */
const PLACEHOLDER_SQUARE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function getRefName(ref: unknown): string {
  if (ref == null) return '—';
  if (typeof ref === 'object' && ref !== null && 'name' in ref) return (ref as { name?: string }).name ?? '—';
  return typeof ref === 'string' ? ref : '—';
}

function getRefSlug(ref: unknown): string {
  if (ref == null) return '';
  if (typeof ref === 'object' && ref !== null && 'slug' in ref) return (ref as { slug?: string }).slug ?? '';
  return '';
}

function getRefId(ref: unknown): string {
  if (ref == null) return '';
  if (typeof ref === 'object' && ref !== null && '_id' in ref) return (ref as { _id: string })._id ?? '';
  return typeof ref === 'string' ? ref : '';
}

function getGridDimensions(gridSizeRef: unknown): { rows: number; cols: number } {
  const slug = getRefSlug(gridSizeRef);
  const name = typeof gridSizeRef === 'object' && gridSizeRef !== null && 'name' in gridSizeRef
    ? (gridSizeRef as { name?: string }).name ?? ''
    : '';
  const str = (slug || name).toLowerCase();
  const match = str.match(/(\d+)\s*[x×\-]\s*(\d+)/);
  if (match) {
    const rows = Math.min(10, Math.max(1, parseInt(match[1], 10)));
    const cols = Math.min(15, Math.max(1, parseInt(match[2], 10)));
    return { rows, cols };
  }
  if (/tambola|housie|bingo/i.test(str)) return { rows: 3, cols: 9 };
  return { rows: 3, cols: 9 };
}

function getWinningPatternInfo(slug: string, name?: string, desc?: string): { label: string; description: string } {
  if (name || desc) return { label: name || slug || 'Winning Pattern', description: desc || 'Complete the pattern to win.' };
  const s = (slug || '').toLowerCase();
  if (s.includes('full-house') || s.includes('fullhouse')) return { label: 'Full House', description: 'All 25 squares must be marked.' };
  if (s === 'row' || s.includes('horizontal') || s.includes('first-line') || s.includes('line1')) return { label: 'Any Horizontal Line', description: '5 squares in any one row.' };
  if (s.includes('second-line') || s.includes('line2')) return { label: 'Second Line', description: 'Complete the middle row.' };
  if (s.includes('third-line') || s.includes('line3')) return { label: 'Third Line', description: 'Complete the bottom row.' };
  if (s === 'column') return { label: 'Any Vertical Line', description: '5 squares in any one column.' };
  if (s.includes('early-five') || s.includes('earlyfive')) return { label: 'Early Five', description: 'Mark any 5 numbers first.' };
  if (s.includes('four-corners') || s === 'corners') return { label: 'Four Corners', description: 'Mark the four corner numbers.' };
  if (s === 'diagonal') return { label: 'Diagonal', description: 'Complete either diagonal.' };
  if (s === 'x') return { label: 'X', description: 'Complete both diagonals.' };
  return { label: slug || 'Winning Pattern', description: 'Complete the pattern to win.' };
}

/** Returns set of cell keys that form the winning pattern (e.g. "0-0", "0-1"). Aligns with API winning-pattern-engine slugs. */
function getWinningPatternCells(rows: number, cols: number, winningSlug: string): Set<string> {
  const s = (winningSlug || '').toLowerCase().trim().replace(/\s+/g, '-');
  const set = new Set<string>();
  const add = (r: number, c: number) => set.add(`${r}-${c}`);

  if (s === 'full-house' || s.includes('fullhouse')) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) add(r, c);
    return set;
  }
  if (s === 'row' || s.includes('horizontal') || s.includes('first-line') || s.includes('line1')) {
    for (let c = 0; c < cols; c++) add(0, c);
    return set;
  }
  if (s.includes('second-line') || s.includes('line2')) {
    for (let c = 0; c < cols; c++) add(1, c);
    return set;
  }
  if (s.includes('third-line') || s.includes('line3')) {
    for (let c = 0; c < cols; c++) add(rows - 1, c);
    return set;
  }
  if (s === 'column') {
    for (let c = 0; c < cols; c++) add(0, c);
    return set;
  }
  if (s === 'corners' || s.includes('four-corners')) {
    add(0, 0); add(0, cols - 1); add(rows - 1, 0); add(rows - 1, cols - 1);
    return set;
  }
  if (s === 'diagonal') {
    const len = Math.min(rows, cols);
    for (let i = 0; i < len; i++) add(i, i);
    return set;
  }
  if (s === 'x') {
    const len = Math.min(rows, cols);
    for (let i = 0; i < len; i++) {
      add(i, i);
      add(i, cols - 1 - i);
    }
    return set;
  }
  if (s.includes('early-five') || s.includes('earlyfive')) {
    for (let i = 0; i < Math.min(5, rows * cols); i++) add(Math.floor(i / cols), i % cols);
    return set;
  }
  for (let c = 0; c < cols; c++) add(0, c);
  return set;
}

/** Which cells to show in pattern preview (same as winning pattern). */
function getPatternPreviewCells(rows: number, cols: number, winningSlug: string): Set<string> {
  return getWinningPatternCells(rows, cols, winningSlug);
}

interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type?: 'claim' | 'win' | 'join' | 'info';
}

export default function CreateDynamicGamePage() {
  const params = useParams();
  const id = params?.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [claimed, setClaimed] = useState<Record<string, number>>({});
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [timerStarted, setTimerStarted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasAnnouncedWin, setHasAnnouncedWin] = useState(false);

  const [gameCard, setGameCard] = useState<GameCardType | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [editSquares, setEditSquares] = useState<GameCardType['squares'] | null>(null);
  const [savingSquares, setSavingSquares] = useState(false);
  const [claimUserId, setClaimUserId] = useState('');
  const [claimingIndex, setClaimingIndex] = useState<number | null>(null);
  const [patternTypesForGame, setPatternTypesForGame] = useState<{ _id: string; name: string; slug: string; description?: string }[]>([]);
  /** Selected winning pattern type IDs (multi-select). Win when ANY is completed. */
  const [selectedPatternTypeIds, setSelectedPatternTypeIds] = useState<string[]>([]);
  const [applyingPatterns, setApplyingPatterns] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const winningPattId = useMemo(() => game ? getRefId(game.winning_patt_id) : '', [game]);
  const gamePatternTypeId = useMemo(() => game ? getRefId((game as { winning_pattern_type_id?: unknown }).winning_pattern_type_id) : '', [game]);
  const gamePatternTypeIds = useMemo(() => {
    const g = game as { winning_pattern_type_ids?: { _id?: string }[] | string[] };
    const ids = g?.winning_pattern_type_ids;
    if (Array.isArray(ids) && ids.length > 0)
      return ids.map((x) => (typeof x === 'string' ? x : (x as { _id?: string })._id ?? '')).filter(Boolean);
    if (gamePatternTypeId) return [gamePatternTypeId];
    return [];
  }, [game, gamePatternTypeId]);

  useEffect(() => {
    if (!winningPattId) {
      setPatternTypesForGame([]);
      return;
    }
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 20000);
    const token = document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1];
    fetch(API_ENDPOINTS.WINNING_PATTERN_TYPES.LIST_BY_PATTERN(winningPattId), {
      headers: { Authorization: `Bearer ${token}` },
      signal: abort.signal,
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPatternTypesForGame(Array.isArray(data) ? data : []))
      .catch(() => setPatternTypesForGame([]))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      abort.abort();
    };
  }, [winningPattId]);

  const [retryKey, setRetryKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    abortRef.current = new AbortController();
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];
    fetch(API_ENDPOINTS.GAMES.GET(id), {
      headers: { Authorization: `Bearer ${token}` },
      signal: abortRef.current.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load game');
        return res.json();
      })
      .then((data) => {
        setGame(data);
        const ids = (data.player_ids ?? []) as { _id?: string; name?: string }[];
        const names = ids.map((p: { _id?: string; name?: string }) => (typeof p === 'object' && p?.name ? p.name : `Player`));
        if (names.length > 0) setPlayers(names);
        else setPlayers(['Host']);
        const typeIds = (data as { winning_pattern_type_ids?: { _id?: string }[] | string[] }).winning_pattern_type_ids;
        const singleId = (data as { winning_pattern_type_id?: { _id?: string } }).winning_pattern_type_id;
        if (Array.isArray(typeIds) && typeIds.length > 0)
          setSelectedPatternTypeIds(typeIds.map((x) => (typeof x === 'string' ? x : (x as { _id?: string })._id ?? '')).filter(Boolean));
        else if (singleId) setSelectedPatternTypeIds([typeof singleId === 'string' ? singleId : (singleId as { _id?: string })._id ?? '']);
        else setSelectedPatternTypeIds([]);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load game');
      })
      .finally(() => setLoading(false));
    return () => {
      abortRef.current?.abort();
    };
  }, [id, retryKey]);

  const gridDims = useMemo(() => game ? getGridDimensions(game.grid_size_id) : { rows: 3, cols: 9 }, [game]);
  const winningSlugFromPattern = useMemo(() => game ? getRefSlug(game.winning_patt_id) : '', [game]);
  const winningSlugFromType = useMemo(() => game ? getRefSlug((game as { winning_pattern_type_id?: unknown }).winning_pattern_type_id) : '', [game]);
  const activePatternType = useMemo(
    () => (gamePatternTypeId && patternTypesForGame.length > 0 ? patternTypesForGame.find((t) => t._id === gamePatternTypeId) : null),
    [gamePatternTypeId, patternTypesForGame],
  );
  const activeSlug = useMemo(() => {
    if (activePatternType && activePatternType.slug) return activePatternType.slug;
    if (winningSlugFromType) return winningSlugFromType;
    return winningSlugFromPattern;
  }, [activePatternType, winningSlugFromType, winningSlugFromPattern]);
  const winningInfo = useMemo(
    () => getWinningPatternInfo(activeSlug, activePatternType ? activePatternType.name : undefined, activePatternType ? activePatternType.description : undefined),
    [activeSlug, activePatternType],
  );
  const appliedPatternLabels = useMemo(() => {
    if (gamePatternTypeIds.length === 0) return [];
    return gamePatternTypeIds
      .map((typeId) => patternTypesForGame.find((pt) => pt._id === typeId))
      .filter(Boolean)
      .map((pt) => getWinningPatternInfo((pt as { slug: string }).slug, (pt as { name?: string }).name, (pt as { description?: string }).description).label);
  }, [gamePatternTypeIds, patternTypesForGame]);
  const gameTypeSlug = useMemo(() => game ? getRefSlug(game.game_type_id) : '', [game]);
  const isTambolaStyle = useMemo(() => /tambola|housie|bingo/i.test(gameTypeSlug || getRefSlug(game?.grid_size_id) || ''), [game, gameTypeSlug]);
  const { rows, cols } = gridDims;
  const winningCellsSet = useMemo(() => getWinningPatternCells(rows, cols, activeSlug), [rows, cols, activeSlug]);
  const patternPreviewSet = useMemo(() => getPatternPreviewCells(rows, cols, activeSlug), [rows, cols, activeSlug]);

  const generateRowNumbers = useCallback((rowIndex: number): (number | string)[] => {
    if (isTambolaStyle && rows === 3 && cols === 9) {
      return Array.from({ length: 9 }, (_, c) => c * 10 + rowIndex + 1);
    }
    return Array.from({ length: cols }, (_, i) => rowIndex * cols + i + 1);
  }, [isTambolaStyle, rows, cols]);

  const getToken = useCallback(() =>
    document.cookie.split('; ').find((row) => row.startsWith('auth-token='))?.split('=')[1], []);

  const fetchCardList = useCallback(async () => {
    if (!id || !getToken()) return;
    setCardLoading(true);
    setCardError(null);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_CARDS.LIST(id), { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Failed to fetch cards');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const latest = list[0];
      if (latest) {
        setGameCard(latest);
        setEditSquares(latest.squares?.map((s: Record<string, unknown>) => ({ ...s })) ?? []);
      }
    } catch (e) {
      setCardError(e instanceof Error ? e.message : 'Failed to fetch cards');
    } finally {
      setCardLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    if (game && id) fetchCardList();
  }, [game, id, fetchCardList]);

  const handleClaimSquare = useCallback(async (squareIndex: number) => {
    if (!gameCard?._id || !claimUserId.trim() || game?.status !== 'ACTIVE') return;
    setClaimingIndex(squareIndex);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_CARDS.CLAIM(gameCard._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ squareIndex, userId: claimUserId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showErrorToast(data.message || 'Claim failed');
        return;
      }
      showSuccessToast(data.won ? 'You won!' : 'Square claimed');
      fetchCardList();
      if (data.won && id) {
        fetch(API_ENDPOINTS.GAMES.GET(id), { headers: { Authorization: `Bearer ${getToken()}` } })
          .then((r) => r.ok && r.json())
          .then((g) => g && setGame(g))
          .catch(() => {});
      }
    } catch {
      showErrorToast('Claim failed');
    } finally {
      setClaimingIndex(null);
    }
  }, [gameCard?._id, claimUserId, game?.status, id, getToken, showErrorToast, showSuccessToast, fetchCardList]);

  const handleGenerateCard = useCallback(async () => {
    if (!id || !getToken()) return;
    setGenerating(true);
    setCardError(null);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_CARDS.GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ game_id: id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate card');
      }
      const created = await res.json();
      setGameCard(created);
      setEditSquares(created.squares?.map((s: GameCardType['squares'][0]) => ({ ...s })) ?? []);
    } catch (e) {
      setCardError(e instanceof Error ? e.message : 'Failed to generate card');
    } finally {
      setGenerating(false);
    }
  }, [id, getToken]);

  const handleRegenerateCard = useCallback(async () => {
    if (!gameCard?._id || !getToken()) return;
    setRegenerating(true);
    setCardError(null);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_CARDS.REGENERATE(gameCard._id), {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to regenerate card');
      const updated = await res.json();
      setGameCard(updated);
      setEditSquares(updated.squares?.map((s: GameCardType['squares'][0]) => ({ ...s })) ?? []);
    } catch (e) {
      setCardError(e instanceof Error ? e.message : 'Failed to regenerate card');
    } finally {
      setRegenerating(false);
    }
  }, [gameCard?._id, getToken]);

  const togglePatternTypeSelection = useCallback((patternTypeId: string) => {
    setSelectedPatternTypeIds((prev) =>
      prev.includes(patternTypeId) ? prev.filter((id) => id !== patternTypeId) : [...prev, patternTypeId]
    );
  }, []);

  const handleApplyPatterns = useCallback(async () => {
    if (!id || !getToken()) return;
    setApplyingPatterns(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAMES.UPDATE(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ winning_pattern_type_ids: selectedPatternTypeIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to apply patterns');
      }
      const updated = await res.json();
      setGame(updated);
      showSuccessToast('Winning patterns applied. Generate the claim grid below.', 'Success');
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to apply patterns');
    } finally {
      setApplyingPatterns(false);
    }
  }, [id, getToken, selectedPatternTypeIds, showSuccessToast, showErrorToast]);

  const handleSaveSquares = useCallback(async () => {
    if (!gameCard?._id || editSquares == null || !getToken()) return;
    setSavingSquares(true);
    setCardError(null);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_CARDS.UPDATE_SQUARES(gameCard._id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          squares: editSquares.map((s) => ({
            asset_id: typeof s.asset_id === 'object' && s.asset_id && '_id' in s.asset_id ? s.asset_id._id : s.asset_id,
            isCustom: s.isCustom,
            customText: s.customText ?? '',
            claimed: s.claimed,
            claimedAt: s.claimedAt,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed to save squares');
      const updated = await res.json();
      setGameCard(updated);
      setEditSquares(updated.squares?.map((s: GameCardType['squares'][0]) => ({ ...s })) ?? []);
    } catch (e) {
      setCardError(e instanceof Error ? e.message : 'Failed to save squares');
    } finally {
      setSavingSquares(false);
    }
  }, [gameCard?._id, editSquares, getToken]);

  const addActivity = useCallback((message: string, type: ActivityItem['type'] = 'info') => {
    setActivity((prev) => [
      ...prev.slice(-49),
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, time: new Date().toLocaleTimeString(), type },
    ]);
  }, []);

  const isWon = useMemo(() => {
    const claimedSet = new Set(Object.keys(claimed));
    for (const key of winningCellsSet) if (!claimedSet.has(key)) return false;
    return winningCellsSet.size > 0;
  }, [claimed, winningCellsSet]);

  const winningHighlightCells = useMemo(() => {
    if (!isWon) return new Set<string>();
    return new Set(winningCellsSet);
  }, [isWon, winningCellsSet]);

  useEffect(() => {
    if (isWon && !hasAnnouncedWin) {
      addActivity(`${winningInfo.label} completed!`, 'win');
      setHasAnnouncedWin(true);
    }
  }, [isWon, hasAnnouncedWin, winningInfo.label, addActivity]);

  useEffect(() => {
    if (timerStarted == null) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - timerStarted) / 1000)), 1000);
    return () => clearInterval(t);
  }, [timerStarted]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`;
    if (claimed[key] != null) return;
    const next = { ...claimed, [key]: currentPlayer };
    setClaimed(next);
    if (timerStarted == null) setTimerStarted(Date.now());
    const name = players[currentPlayer] ?? `Player ${currentPlayer + 1}`;
    addActivity(`${name} claimed cell (${rowIndex + 1},${colIndex + 1})`, 'claim');
    setCurrentPlayer((p) => (p + 1) % Math.max(1, players.length));
  }, [claimed, currentPlayer, players, timerStarted, addActivity]);

  const maxPlayer = game?.max_player != null ? Number(game.max_player) : undefined;
  const canAddPlayer = maxPlayer == null || players.length < maxPlayer;
  const playerCount = players.length;

  const statusBadgeColor =
    game?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
    game?.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
    game?.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400' :
    'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400';

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game Play" />
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Game Play" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Game not found'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Retry
            </button>
            <Link href={ROUTES.GAMES} className="text-sm font-medium text-brand-600 hover:underline">Back to games</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PageBreadcrumb pageTitle="Game Play" />

      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{game.name || 'Game'}</h1>
          <span className="rounded bg-gray-200 px-2 py-0.5 font-mono text-sm text-gray-700 dark:bg-gray-600 dark:text-gray-200">
            {game.game_code || '—'}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColor}`}>
            {game.status || 'DRAFT'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Players: <strong className="text-gray-800 dark:text-white">{playerCount}</strong>
          </span>
        </div>
        <Link href={ROUTES.GAMES}>
          <Button type="button" size="sm" variant="outline">Back to list</Button>
        </Link>
      </header>

      {/* Card generation */}
      <section className="border-b border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Card generation</h2>
          {cardError && (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">{cardError}</p>
          )}
          {!gameCard ? (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                onClick={handleGenerateCard}
                disabled={generating || cardLoading}
              >
                {generating ? 'Generating...' : 'Generate card'}
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Fetches eligible assets by category + subscription, random grid (no duplicates).
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {game?.status === 'ACTIVE' && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Claim as user ID</label>
                  <input
                    type="text"
                    value={claimUserId}
                    onChange={(e) => setClaimUserId(e.target.value)}
                    placeholder="User ID (card owner)"
                    className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white w-48"
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {game?.status !== 'ACTIVE' && (
                  <>
                    <Button type="button" size="sm" variant="outline" onClick={handleRegenerateCard} disabled={regenerating}>
                      {regenerating ? 'Regenerating...' : 'Regenerate card'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveSquares}
                      disabled={!!(savingSquares || (editSquares && JSON.stringify(editSquares) === JSON.stringify(gameCard.squares)))}
                    >
                      {savingSquares ? 'Saving...' : 'Save custom text'}
                    </Button>
                  </>
                )}
              </div>
              <div
                className="inline-grid gap-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  width: cols * 64,
                }}
              >
                {(editSquares ?? gameCard.squares ?? []).map((sq, idx) => {
                  const asset = typeof sq.asset_id === 'object' && sq.asset_id && 'imageUrl' in sq.asset_id ? sq.asset_id : null;
                  const rawUrl = sq.isCustom ? PLACEHOLDER_SQUARE : (asset?.imageUrl ?? PLACEHOLDER_SQUARE);
                  const imageUrl = typeof rawUrl === 'string' && rawUrl.startsWith('assets/') ? `${API_URL.CLIENT}/${rawUrl}` : rawUrl;
                  const squares = editSquares ?? gameCard.squares ?? [];
                  const current = squares[idx] as { isCustom?: boolean; customText?: string; claimed?: boolean };
                  const isClaimed = current?.claimed ?? (sq as { claimed?: boolean }).claimed;
                  const canClaim = game?.status === 'ACTIVE' && claimUserId.trim() && !isClaimed;
                  return (
                    <div
                      key={idx}
                      className={`relative flex h-20 w-16 flex-col items-center justify-center border border-gray-100 dark:border-gray-700 ${isClaimed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-10 w-10 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SQUARE; }}
                      />
                      {game?.status === 'ACTIVE' ? (
                        isClaimed ? (
                          <span className="mt-0.5 text-[10px] text-green-600 dark:text-green-400">Claimed</span>
                        ) : canClaim ? (
                          <button
                            type="button"
                            onClick={() => handleClaimSquare(idx)}
                            disabled={claimingIndex !== null}
                            className="mt-0.5 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] text-white hover:bg-brand-700 disabled:opacity-50"
                          >
                            {claimingIndex === idx ? '...' : 'Claim'}
                          </button>
                        ) : null
                      ) : current?.isCustom ? (
                        <input
                          type="text"
                          value={current?.customText ?? ''}
                          onChange={(e) => {
                            const next = [...squares];
                            if (next[idx]) next[idx] = { ...next[idx], customText: e.target.value };
                            setEditSquares(next);
                          }}
                          placeholder="Custom text"
                          className="mt-0.5 w-full max-w-full border-0 bg-transparent px-1 py-0 text-center text-xs focus:ring-1 focus:ring-brand-500"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...squares];
                            if (next[idx]) next[idx] = { ...next[idx], isCustom: true, asset_id: null, customText: '' };
                            setEditSquares(next);
                          }}
                          className="mt-0.5 text-[10px] text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Set custom
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main: Left | Center | Right */}
      <div className="flex flex-1 flex-col lg:flex-row gap-4 p-4">
        {/* Left: Player list */}
        <aside className="w-full lg:w-56 shrink-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Players</h2>
          <ul className="space-y-2">
            {players.map((name, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  i === currentPlayer ? 'bg-brand-100 dark:bg-brand-500/20 font-medium text-brand-800 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
                {name}
              </li>
            ))}
          </ul>
          {canAddPlayer && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => {
                setPlayers((prev) => [...prev, `Player ${prev.length + 1}`]);
                addActivity(`Player ${players.length + 1} joined.`, 'join');
              }}
            >
              Add player
            </Button>
          )}
        </aside>

        {/* Center: Asset grid (when card exists) or number grid (fallback) */}
        <main className="flex-1 flex flex-col items-center justify-center">
          {gameCard && (editSquares ?? gameCard.squares ?? []).length > 0 ? (
            <>
              <div
                className="inline-grid gap-0 overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  width: cols * 72,
                }}
              >
                {(editSquares ?? gameCard.squares ?? []).map((sq, idx) => {
                  const asset = typeof sq.asset_id === 'object' && sq.asset_id && 'imageUrl' in sq.asset_id ? sq.asset_id : null;
                  const imageUrl = sq.isCustom ? PLACEHOLDER_SQUARE : (asset?.imageUrl ?? PLACEHOLDER_SQUARE);
                  const resolvedUrl = imageUrl.startsWith('assets/') ? `${API_URL.CLIENT}/${imageUrl}` : imageUrl;
                  const squares = editSquares ?? gameCard.squares ?? [];
                  const current = squares[idx] as { isCustom?: boolean; customText?: string; claimed?: boolean };
                  const isClaimed = current?.claimed ?? (sq as { claimed?: boolean }).claimed;
                  const canClaim = game?.status === 'ACTIVE' && claimUserId.trim() && !isClaimed;
                  const rowIndex = Math.floor(idx / cols);
                  const colIndex = idx % cols;
                  const key = `${rowIndex}-${colIndex}`;
                  const isWinningCell = winningHighlightCells.has(key);
                  return (
                    <div
                      key={idx}
                      className={`relative flex h-[72px] w-[72px] flex-col items-center justify-center border border-gray-200 dark:border-gray-600 ${isClaimed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'} ${isWinningCell ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                    >
                      <img
                        src={resolvedUrl}
                        alt=""
                        className="h-14 w-14 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SQUARE; }}
                      />
                      {game?.status === 'ACTIVE' ? (
                        isClaimed ? (
                          <span className="mt-1 text-[10px] font-medium text-green-600 dark:text-green-400">CLAIMED ✓</span>
                        ) : canClaim ? (
                          <button
                            type="button"
                            onClick={() => handleClaimSquare(idx)}
                            disabled={claimingIndex !== null}
                            className="mt-1 rounded bg-brand-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                          >
                            {claimingIndex === idx ? '...' : 'Claim'}
                          </button>
                        ) : null
                      ) : (
                        current?.customText ? (
                          <span className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-full px-0.5">{current.customText}</span>
                        ) : null
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Click to claim · Grid {rows}×{cols} · {appliedPatternLabels.length > 1 ? `Any of: ${appliedPatternLabels.join(', ')}` : winningInfo.label}
              </p>
            </>
          ) : (
            <>
              <div
                className="inline-block overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
                style={{ minWidth: `${cols * 52}px` }}
              >
                {Array.from({ length: rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    {generateRowNumbers(rowIndex).map((num, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const claimedBy = claimed[key];
                      const isWinningCell = winningHighlightCells.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`
                            relative flex h-12 w-12 shrink-0 items-center justify-center border-r border-gray-200 dark:border-gray-600 last:border-r-0
                            text-sm font-semibold transition
                            ${claimedBy != null
                              ? 'cursor-default bg-brand-100 text-brand-800 dark:bg-brand-500/30 dark:text-brand-200'
                              : 'cursor-pointer bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }
                            ${isWinningCell ? 'animate-pulse ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-800' : ''}
                          `}
                        >
                          {num != null ? num : '—'}
                          {claimedBy != null && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-bold text-white dark:bg-white/20">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Generate the card above to show asset images here · Grid {rows}×{cols} · {appliedPatternLabels.length > 1 ? `Any of: ${appliedPatternLabels.join(', ')}` : winningInfo.label}
              </p>
            </>
          )}
        </main>

        {/* Right: Pattern preview(s), Rules, Timer, Leave */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Winning pattern types
            </h2>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Select one or more patterns. Players win when they complete <strong>any</strong> selected pattern.
            </p>
            {patternTypesForGame.length > 0 ? (
              <div className="space-y-3">
                {patternTypesForGame.map((pt) => {
                  const isSelected = selectedPatternTypeIds.includes(pt._id);
                  const previewSet = getWinningPatternCells(rows, cols, pt.slug);
                  const info = getWinningPatternInfo(pt.slug, pt.name, pt.description);
                  return (
                    <button
                      key={pt._id}
                      type="button"
                      onClick={() => togglePatternTypeSelection(pt._id)}
                      className={`w-full text-left rounded-xl border p-4 dark:bg-gray-800 transition-colors ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-500/10 ring-2 ring-brand-500/30'
                          : 'border-gray-200 bg-white dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-600"
                          style={{ width: cols * 20, height: rows * 20 }}
                        >
                          {Array.from({ length: rows }, (_, r) => (
                            <div key={r} className="flex">
                              {Array.from({ length: cols }, (_, c) => (
                                <div
                                  key={c}
                                  className={`h-5 w-5 border-r border-b border-gray-200 dark:border-gray-600 text-[8px] flex items-center justify-center ${
                                    previewSet.has(`${r}-${c}`) ? 'bg-amber-200 dark:bg-amber-500/40 font-medium' : 'bg-gray-50 dark:bg-gray-700/50'
                                  }`}
                                >
                                  {previewSet.has(`${r}-${c}`) ? '•' : ''}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{info.label}</p>
                          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
                          {isSelected && (
                            <span className="mt-1.5 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                              Selected
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyPatterns}
                  disabled={applyingPatterns || selectedPatternTypeIds.length === 0}
                  className="w-full"
                >
                  {applyingPatterns ? 'Applying...' : 'Apply to game'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Then use <strong>Generate card</strong> below to create the claim grid with assets.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800">
                <div
                  className="inline-block overflow-hidden rounded border border-gray-200 dark:border-gray-600"
                  style={{ width: cols * 24, height: rows * 24 }}
                >
                  {Array.from({ length: rows }, (_, r) => (
                    <div key={r} className="flex">
                      {Array.from({ length: cols }, (_, c) => (
                        <div
                          key={c}
                          className={`h-6 w-6 border-r border-b border-gray-200 dark:border-gray-600 text-[10px] flex items-center justify-center ${
                            patternPreviewSet.has(`${r}-${c}`) ? 'bg-amber-200 dark:bg-amber-500/40 font-medium' : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          {patternPreviewSet.has(`${r}-${c}`) ? '•' : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{winningInfo.label}</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Rules</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {appliedPatternLabels.length > 1
                ? `Complete any of: ${appliedPatternLabels.join(', ')}.`
                : appliedPatternLabels.length === 1
                  ? `${appliedPatternLabels[0]}: ${winningInfo.description}`
                  : winningInfo.description}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Timer</h2>
            <p className="font-mono text-lg text-gray-800 dark:text-white">
              {timerStarted != null ? `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}` : '0:00'}
            </p>
          </div>
          <Link href={ROUTES.GAMES} className="block">
            <Button type="button" size="sm" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
              Leave game
            </Button>
          </Link>
        </aside>
      </div>

      {/* Bottom: Real-time activity feed */}
      <div className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Activity</h2>
          <div className="flex flex-wrap gap-2">
            {activity.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No activity yet. Claim cells to see updates.</p>
            ) : (
              activity.slice().reverse().slice(0, 12).map((item) => (
                <span
                  key={item.id}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
                    item.type === 'win' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' :
                    item.type === 'claim' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' :
                    item.type === 'join' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="mr-1.5 text-gray-400 dark:text-gray-500">{item.time}</span>
                  {item.message}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
