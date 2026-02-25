/**
 * Game invite (closed games)
 */
export interface GameInvite {
  _id: string;
  game_id: string | { _id: string; name?: string; game_code?: string; status?: string };
  invitedUserId: string | { _id: string; fullName?: string; email?: string };
  invitedBy: string | { _id: string; fullName?: string; email?: string };
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  createdAt?: string;
  updatedAt?: string;
}
