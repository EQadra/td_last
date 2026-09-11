export interface CreateLawyerPayload {
  first_name: string;
  last_name: string;

  description?: string;
  specialty?: string;
  license_code?: string;

  city?: string;
  university?: string;
  image?: string;
  schedule?: string;
}
