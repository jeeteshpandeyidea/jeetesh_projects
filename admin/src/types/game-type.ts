/**
 * Game Type type definitions
 */

export interface GameType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GameTypeFormData {
  name: string;
  slug?: string;
  description?: string;
  status?: string;
}
