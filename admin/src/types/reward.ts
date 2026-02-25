/**
 * Reward type definitions
 */

export interface Reward {
  _id: string;
  name: string;
  slug: string;
  value?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface RewardFormData {
  name: string;
  slug?: string;
  value?: number;
  status?: string;
}
