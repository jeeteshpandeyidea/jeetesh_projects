'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

export default function JoinByCodeForm() {
  const [gameCode, setGameCode] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const getToken = () =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || !userId.trim()) {
      showError('Game code and user ID are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GAMES.JOIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ gameCode: gameCode.trim().toUpperCase(), userId: userId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.message || 'Failed to join game');
        return;
      }
      if (data.onWaitlist) {
        showSuccess('Game is full; you were added to the waitlist', 'On waitlist');
      } else {
        showSuccess(data.message || 'Joined game', 'Success');
      }
      setGameCode('');
      setUserId('');
    } catch {
      showError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[120px]">
        <Label htmlFor="join-gameCode">Game code</Label>
        <Input
          id="join-gameCode"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="e.g. GM001"
          disabled={loading}
        />
      </div>
      <div className="min-w-[180px]">
        <Label htmlFor="join-userId">User ID</Label>
        <Input
          id="join-userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID to join as"
          disabled={loading}
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Joining…' : 'Join game'}
      </Button>
    </form>
  );
}
