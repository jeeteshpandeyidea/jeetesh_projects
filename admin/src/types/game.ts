/**
 * Game type definitions (matches API Games with populated refs)
 */

export interface Game {
  _id: string;
  name?: string;
  event_id: string | { _id: string; name?: string; slug?: string };
  category_id?: string | { _id: string; name?: string; slug?: string };
  grid_size_id?: string | { _id: string; name?: string; slug?: string };
  card_gen_id?: string | { _id: string; name?: string; slug?: string };
  game_type_id?: string | { _id: string; name?: string; slug?: string };
  winning_patt_id?: string | { _id: string; name?: string; slug?: string };
  winning_pattern_type_id?: string | { _id: string; name?: string; slug?: string };
  access_control: boolean;
  max_player?: number;
  game_start_date?: string;
  description?: string;
  status: string;
  game_mode?: string;
  game_code?: string;
  winner_id?: string | { _id: string; name?: string; fullName?: string; email?: string } | null;
  player_ids?: string[] | { _id: string; fullName?: string; email?: string }[];
  waitlist_ids?: string[] | { _id: string; fullName?: string; email?: string }[];
  eliminated_player_ids?: string[] | { _id: string; fullName?: string; email?: string }[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface GameFormData {
  name: string;
  event_id: string;
  category_id?: string;
  grid_size_id?: string;
  card_gen_id?: string;
  game_type_id?: string;
  winning_patt_id?: string;
  access_control: boolean;
  max_player?: number;
  game_start_date?: string;
  description?: string;
  status?: string;
}
