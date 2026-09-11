import { User } from './user';
import { Comment } from './comment';

export interface CreateServicePayload {
  serviceable_id: number;
  serviceable_type: string; // "App\\Models\\Doctor", etc

  name: string;
  description?: string | null;
  price: number;            // 👈 REQUIRED
  duration?: string | null;
  image?: string | null;
}
