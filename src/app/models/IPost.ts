export interface IPost {
  categoryId: string;
  description: string;
  id: string;
  title: string;
  categoryName?: string;
}

export interface CRUDAction<T> {
  action: 'add' | 'update' | 'delete';
  data: T;
}
