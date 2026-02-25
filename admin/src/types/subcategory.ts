export interface SubCategory {
  id: string;
  _id?: string; // API may return _id (Mongo)
  name: string;
  category_id: string | { _id: string; name?: string };
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** Payload for create/update; category_id is always string */
export type SubCategoryInput = Omit<SubCategory, 'id' | 'createdAt' | 'category_id'> & {
  category_id: string;
};
