import { User } from './user';

export interface BasePolymorphic {
  id: number;

  user_id: number;
  user: User;

  created_at: string;
  updated_at?: string;
}
