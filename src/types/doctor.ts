export interface Doctor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  description?: string;
  career?: string;
  specialty?: string;
  graduate_code?: string;
  services?: string;
  city?: string;
  university?: string;
  image?: string;
  schedule?: string;
  created_at: string;
  updated_at: string;
  user?: any;
  feedbacks?: any[];
  posts?: any[];
  services?: any[];
}