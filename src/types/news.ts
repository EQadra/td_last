import { User } from "./user";

export interface News {
  id: number;

  title?: string | null;
  descripcion?: string | null;

  url?: string | null;   // ✅ SOLUCIÓN AQUÍ

  created_at?: string;
  updated_at?: string;

  // relaciones
  user?: User;
}
