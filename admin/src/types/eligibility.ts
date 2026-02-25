/**
 * Eligibility type definitions
 */

export interface Eligibility {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface EligibilityFormData {
  name: string;
  slug?: string;
  description?: string;
  status?: string;
}
