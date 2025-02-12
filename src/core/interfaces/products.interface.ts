export interface IPRODUCT {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
}
