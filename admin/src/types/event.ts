/**
 * Event type definitions
 */

export interface Event {
  _id: string;
  name: string;
  slug?: string;
  category_id?: string | { _id: string; name?: string };
  event_type_id: string | { _id: string; name?: string };
  eligibility_id?: string | { _id: string; name?: string };
  winning_condition?: string;
  game_type_id?: string | { _id: string; name?: string };
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  reward_id?: string | { _id: string; name?: string };
  rewards_value?: number;
  distribution?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface EventFormData {
  name: string;
  category_id?: string;
  event_type_id: string;
  eligibility_id?: string;
  winning_condition?: string;
  game_type_id?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  reward_id?: string;
  rewards_value?: number;
  distribution?: string;
  description?: string;
  status?: string;
}
