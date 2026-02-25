export type VisibilityType = 'FREE' | 'PREMIUM' | 'ORG_ONLY';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  visibility_type?: VisibilityType;
  createdAt: string;
}

export type CategoryInput = Omit<Category, 'id' | 'createdAt'>;
