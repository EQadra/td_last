import { Shop } from './shop';
import { Comment } from './comment';

export interface Product {
  id: number;

  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;

  productable_id: number;
  productable_type: string;

  productable: Shop; // 👈 tienda
  comments: Comment[];

  created_at: string;
  updated_at: string;
}
