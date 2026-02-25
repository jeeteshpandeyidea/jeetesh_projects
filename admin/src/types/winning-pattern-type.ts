import { WinningPattern } from './winning-pattern';

export interface WinningPatternType {
  _id: string;
  winning_pattern_id: string | { _id: string; name?: string; slug?: string };
  name: string;
  slug: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface WinningPatternTypeFormData {
  winning_pattern_id: string;
  name: string;
  slug?: string;
  description?: string;
  status?: string;
}
