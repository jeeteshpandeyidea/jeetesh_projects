/**
 * Card Generation Type definitions (matches API)
 */

export interface CardGeneration {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CardGenerationFormData {
  name: string;
  slug?: string;
  status?: string;
}
