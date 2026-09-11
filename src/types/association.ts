// types/association.ts
export interface Association {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  image: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  posts?: any[];
  products?: any[];
  feedbacks?: any[];
  news?: any[];
}