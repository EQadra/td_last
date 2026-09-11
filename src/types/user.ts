export interface Role {
  id: number;
  name: string;
  guard_name?: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;

  roles?: Role[];            // Spatie roles
  permissions?: Permission[]; // Spatie permissions

  created_at?: string;
  updated_at?: string;
}
