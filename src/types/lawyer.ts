import { User } from './user';

export interface Lawyer {
  id: number;
  user_id: number;

  first_name: string;
  last_name: string;
  description?: string;
  specialty?: string;
  license_code?: string;

  city?: string;
  university?: string;
  image?: string;
  schedule?: string;

  created_at?: string;
  updated_at?: string;

  // relaciones
  user?: User;
  feedbacks?: any[];
  posts?: any[];
  services?: any[];
  news?: any[];
}
