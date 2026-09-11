import { AccountRole } from './account.types';

type AccountField = {
  key: string;
  label: string;
  multiline?: boolean;
};

export const ACCOUNT_FIELDS_BY_ROLE: Record<AccountRole, AccountField[]> = {
  doctor: [
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'description', label: 'Descripción', multiline: true },
    { key: 'specialty', label: 'Especialidad' },
    { key: 'graduate_code', label: 'CMP' },
    { key: 'city', label: 'Ciudad' },
    { key: 'university', label: 'Universidad' },
    { key: 'schedule', label: 'Horario' },
  ],
  lawyer: [
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'description', label: 'Descripción', multiline: true },
    { key: 'specialty', label: 'Especialidad' },
    { key: 'license_code', label: 'Código colegiado' },
    { key: 'city', label: 'Ciudad' },
    { key: 'university', label: 'Universidad' },
  ],
  association: [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción', multiline: true },
    { key: 'city', label: 'Ciudad' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'website', label: 'Sitio web' },
  ],
  shop: [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción', multiline: true },
    { key: 'address', label: 'Dirección' },
    { key: 'city', label: 'Ciudad' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'schedule', label: 'Horario' },
  ],
};
