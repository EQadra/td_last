// src/types/service.ts
import { User } from './user';
import { Comment } from './comment';

export interface Service {
  id: number;

  serviceable_id: number;
  serviceable_type: string;

  name: string;
  description?: string | null;
  price?: number | null;
  duration?: string | null;
  image?: string | null;

  comments?: Comment[];

  created_at: string;
  updated_at: string;
}
