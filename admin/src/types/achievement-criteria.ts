/**
 * Achievement Criteria type definitions
 */

export interface AchievementCriteria {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface AchievementCriteriaFormData {
  name: string;
  slug?: string;
  status?: string;
}
