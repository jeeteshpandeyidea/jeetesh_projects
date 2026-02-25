/**
 * Asset type definitions (matches API assets with populated refs)
 */

export interface Asset {
  _id: string;
  title: string;
  code?: string;
  slug: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId: string | { _id: string; name?: string; slug?: string };
  subcategoryId?: string | { _id: string; name?: string; slug?: string };
  accessLevel: string;
  isPlaceholder: boolean;
  status: string;
  sortOrder: number;
  tags: string[];
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetFormData {
  title: string;
  slug?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId: string;
  subcategoryId?: string;
  accessLevel: string;
  isPlaceholder: boolean;
  status: string;
  sortOrder: number;
  tags: string[];
}
