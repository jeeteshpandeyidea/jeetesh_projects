/**
 * Winning Pattern type definitions
 */

export interface WinningPattern {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface WinningPatternFormData {
  name: string;
  slug?: string;
  status?: string;
}
