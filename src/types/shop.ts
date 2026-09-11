import { User } from './user';
import { Feedback } from './feedback';
import { Product } from './product';
import { Service } from './service';
import { News } from './news';

export interface Shop {
  id: number;

  user_id: number;
  user: User;

  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  image?: string | null;
  schedule?: string | null;

  feedbacks: Feedback[];
  products: Product[];
  services: Service[];
  news: News[];

  created_at: string;
  updated_at: string;
}
