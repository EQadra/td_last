export interface CreateProductPayload {
  store_id: number; // 👈 shop id
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
}
