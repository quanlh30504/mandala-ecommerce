export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
}
