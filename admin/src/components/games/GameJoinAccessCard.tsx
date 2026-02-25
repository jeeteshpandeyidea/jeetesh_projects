'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useToast } from '@/context/ToastContext';
import { Game } from '@/types/game';
import { GameInvite } from '@/types/game-invite';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useUsers } from '@/hooks/useUsers';

function refId(ref: string | { _id: string } | undefined): string {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref._id ?? '';
}
function refName(ref: string | { fullName?: string; name?: string } | undefined): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.fullName ?? ref.name ?? '—';
}

interface GameJoinAccessCardProps {
  game: Game;
  currentUserId?: string;
  onGameUpdated: () => void;
}

export default function GameJoinAccessCard({ game, currentUserId = '', onGameUpdated }: GameJoinAccessCardProps) {
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [joinUserId, setJoinUserId] = useState(currentUserId);
  const [leaveUserId, setLeaveUserId] = useState(currentUserId);
  const [inviteUserId, setInviteUserId] = useState('');
  const [invitedByUserId, setInvitedByUserId] = useState(currentUserId);
  const [actionLoading, setActionLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const { users } = useUsers();

  const gameId = game._id;
  const isOpen = !game.access_control;
  const canJoinOrLeave = game.status === 'DRAFT' || game.status === 'SCHEDULED';
  const players = Array.isArray(game.player_ids) ? game.player_ids : [];
  const waitlist = Array.isArray(game.waitlist_ids) ? game.waitlist_ids : [];
  const eliminated = Array.isArray(game.eliminated_player_ids) ? game.eliminated_player_ids : [];

  const getToken = () =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];

  const fetchInvites = useCallback(async () => {
    if (!gameId) return;
    setInvitesLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_INVITES.LIST_BY_GAME(gameId), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(Array.isArray(data) ? data : []);
      }
    } catch {
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId && !isOpen) fetchInvites();
  }, [gameId, isOpen, fetchInvites]);

  const handleJoinByUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = joinUserId.trim();
    if (!userId) {
      showError('User ID is required');
      return;
    }
    const currentPlayerIds = players
      .map((p) => refId(typeof p === 'object' ? (p as { _id: string })._id : p))
      .filter(Boolean);
    const currentWaitlistIds = waitlist
      .map((w) => refId(typeof w === 'object' ? (w as { _id: string })._id : w))
      .filter(Boolean);
    if (currentPlayerIds.includes(userId)) {
      showError('User is already in the game');
      return;
    }
    if (currentWaitlistIds.includes(userId)) {
      showError('User is already on the waitlist');
      return;
    }
    const maxPlayer = game.max_player ?? 0;
    const newPlayerIds = [...currentPlayerIds];
    const newWaitlistIds = [...currentWaitlistIds];
    if (maxPlayer > 0 && currentPlayerIds.length >= maxPlayer) {
      newWaitlistIds.push(userId);
    } else {
      newPlayerIds.push(userId);
    }
    setActionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAMES.UPDATE(gameId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
          'X-Admin-Bypass': 'true',
        },
        body: JSON.stringify({ player_ids: newPlayerIds, waitlist_ids: newWaitlistIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.message || 'Failed to add user');
        return;
      }
      showSuccess(newWaitlistIds.length > currentWaitlistIds.length ? 'Added to waitlist' : 'Joined game', 'Success');
      onGameUpdated();
    } catch {
      showError('Request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = leaveUserId.trim();
    if (!userId) {
      showError('User ID is required');
      return;
    }
    if (!gameId) {
      showError('Game not found');
      return;
    }
    const currentPlayerIds = players
      .map((p) => refId(typeof p === 'object' ? (p as { _id: string })._id : p))
      .filter(Boolean);
    const currentWaitlistIds = waitlist
      .map((w) => refId(typeof w === 'object' ? (w as { _id: string })._id : w))
      .filter(Boolean);
    const newPlayerIds = currentPlayerIds.filter((id) => id !== userId);
    const newWaitlistIds = currentWaitlistIds.filter((id) => id !== userId);
    if (newPlayerIds.length === currentPlayerIds.length && newWaitlistIds.length === currentWaitlistIds.length) {
      showError('User is not in this game or waitlist');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAMES.UPDATE(gameId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
          'X-Admin-Bypass': 'true',
        },
        body: JSON.stringify({ player_ids: newPlayerIds, waitlist_ids: newWaitlistIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.message || 'Failed to remove user');
        return;
      }
      showSuccess('Left game', 'Success');
      onGameUpdated();
    } catch {
      showError('Request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId.trim() || !invitedByUserId.trim()) {
      showError('Invited user and inviter user ID are required');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_INVITES.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          game_id: gameId,
          invitedUserId: inviteUserId.trim(),
          invitedBy: invitedByUserId.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError(data.message || 'Failed to create invite');
        return;
      }
      showSuccess('Invite sent', 'Success');
      setInviteUserId('');
      fetchInvites();
    } catch {
      showError('Request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_INVITES.ACCEPT(inviteId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError(data.message || 'Failed to accept');
        return;
      }
      showSuccess('Invite accepted', 'Success');
      fetchInvites();
      onGameUpdated();
    } catch {
      showError('Request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string, revokedBy: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAME_INVITES.REVOKE(inviteId, revokedBy), {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError(data.message || 'Failed to revoke');
        return;
      }
      showSuccess('Invite revoked', 'Success');
      fetchInvites();
    } catch {
      showError('Request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const userOptions = users.map((u: { _id?: string; id?: string; fullName?: string; username?: string }) => ({
    value: u._id ?? u.id ?? '',
    label: u.fullName ?? u.username ?? u._id ?? u.id ?? '—',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Players ({players.length}{game.max_player != null ? ` / ${game.max_player}` : ''})</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {players.length === 0 && <li>No players yet</li>}
          {players.map((p) => {
            const id = refId(typeof p === 'object' ? (p as { _id: string })._id : p);
            const name = typeof p === 'object' ? refName(p as { fullName?: string }) : id;
            return <li key={id}>{name || id}</li>;
          })}
        </ul>
      </div>

      {waitlist.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Waitlist</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {waitlist.map((w) => {
              const id = refId(typeof w === 'object' ? (w as { _id: string })._id : w);
              const name = typeof w === 'object' ? refName(w as { fullName?: string }) : id;
              return <li key={id}>{name || id}</li>;
            })}
          </ul>
        </div>
      )}

      {eliminated.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eliminated (ELIMINATION mode)</h4>
          <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
            {eliminated.map((e) => {
              const id = refId(typeof e === 'object' ? (e as { _id: string })._id : e);
              const name = typeof e === 'object' ? refName(e as { fullName?: string }) : id;
              return <li key={id}>{name || id}</li>;
            })}
          </ul>
        </div>
      )}

      {canJoinOrLeave && (
        <form onSubmit={handleJoinByUser} className="flex flex-wrap items-end gap-3">
          <h4 className="w-full text-sm font-medium text-gray-700 dark:text-gray-300">Join by user</h4>
          <div className="min-w-[180px]">
            <Label htmlFor="access-join-userId">User ID</Label>
            <Input
              id="access-join-userId"
              value={joinUserId}
              onChange={(e) => setJoinUserId(e.target.value)}
              placeholder="User ID"
              disabled={actionLoading}
            />
          </div>
          <Button type="submit" size="sm" disabled={actionLoading}>
            {actionLoading ? 'Joining…' : 'Join this game'}
          </Button>
        </form>
      )}

      {canJoinOrLeave && (
        <form onSubmit={handleLeave} className="flex flex-wrap items-end gap-3">
          <h4 className="w-full text-sm font-medium text-gray-700 dark:text-gray-300">Leave game</h4>
          <div className="min-w-[180px]">
            <Label htmlFor="access-leave-userId">User ID</Label>
            <Input
              id="access-leave-userId"
              value={leaveUserId}
              onChange={(e) => setLeaveUserId(e.target.value)}
              placeholder="User ID"
              disabled={actionLoading}
            />
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={actionLoading}>
            {actionLoading ? 'Leaving…' : 'Leave game'}
          </Button>
        </form>
      )}

      {!isOpen && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invites (closed game)</h4>
          {invitesLoading ? (
            <p className="text-sm text-gray-500">Loading invites…</p>
          ) : (
            <>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                {invites.length === 0 && <li>No invites</li>}
                {invites.map((inv) => (
                  <li key={inv._id} className="flex items-center gap-2 flex-wrap">
                    <span>
                      {refName(inv.invitedUserId as { fullName?: string })} → {inv.status}
                    </span>
                    {inv.status === 'PENDING' && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcceptInvite(inv._id)}
                          disabled={actionLoading}
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeInvite(inv._id, refId(inv.invitedBy))}
                          disabled={actionLoading}
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {canJoinOrLeave && (
                <form onSubmit={handleCreateInvite} className="flex flex-wrap items-end gap-3 mt-2">
                  <div className="min-w-[140px]">
                    <Label htmlFor="invite-user">Invite user</Label>
                    <select
                      id="invite-user"
                      value={inviteUserId}
                      onChange={(e) => setInviteUserId(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white w-full"
                      disabled={actionLoading}
                    >
                      <option value="">Select user</option>
                      {userOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-[140px]">
                    <Label htmlFor="invite-by">Invited by</Label>
                    <select
                      id="invite-by"
                      value={invitedByUserId}
                      onChange={(e) => setInvitedByUserId(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white w-full"
                      disabled={actionLoading}
                    >
                      <option value="">Select inviter</option>
                      {userOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="sm" disabled={actionLoading || !inviteUserId || !invitedByUserId}>
                    {actionLoading ? 'Sending…' : 'Send invite'}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
