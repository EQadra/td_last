// types/createDoctor.ts
export interface CreateDoctorPayload {
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
}