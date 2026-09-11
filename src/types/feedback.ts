import { User } from './user';

export interface Feedback {
  id: number;
  user_id: number;
  feedbackable_id: number;
  feedbackable_type: string; // App\Models\Doctor, Association, etc

  comment?: string;
  rating: number;

  created_at?: string;
  updated_at?: string;

  user?: User;
  feedbackable?: any;
}
