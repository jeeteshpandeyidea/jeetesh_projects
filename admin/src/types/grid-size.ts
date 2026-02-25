/**
 * Grid Size type definitions
 */

export interface GridSize {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GridSizeFormData {
  name: string;
  slug?: string;
  status?: string;
}
