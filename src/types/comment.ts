import { User } from './user';

export interface Comment {
  id: number;
  user_id: number;
  content: string;

  commentable_id: number;
  commentable_type: string;
  type: string; // Appended attribute

  user: User;

  created_at: string;
}
