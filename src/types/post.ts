// src/types/post.ts
export interface PostComment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    url?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  image_url?: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  postable_type?: string;
  postable_id?: number;
  postable?: {
    id: number;
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  comments: PostComment[];
  likes_count?: number;
  liked?: boolean;
  comments_count?: number;
}