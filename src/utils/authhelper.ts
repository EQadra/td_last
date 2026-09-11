import { User } from '../types/user';

export const hasRole = (user: User | null, role: string) =>
  !!user?.roles?.some((r: any) =>
    typeof r === 'string' ? r === role : r.name === role
  );

export const hasPermission = (user: User | null, permission: string) =>
  !!user?.permissions?.some((p: any) =>
    typeof p === 'string' ? p === permission : p.name === permission
  );
