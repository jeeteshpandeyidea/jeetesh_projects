/**
 * Game card (card generation engine)
 */

export interface GameCardSquare {
  asset_id: string | null | { _id: string; title?: string; imageUrl?: string; thumbnailUrl?: string; isPlaceholder?: boolean };
  isCustom: boolean;
  customText: string;
  claimed: boolean;
  claimedAt: string | null;
}

export interface GameCard {
  _id: string;
  game_id: string | { _id: string; name?: string; game_code?: string; status?: string };
  user_id: string | null | { _id: string; fullName?: string; email?: string };
  gridsize_id: string | { _id: string; name?: string; slug?: string };
  squares: GameCardSquare[];
  createdAt?: string;
  updatedAt?: string;
}
