import { Product } from '../../types';

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'>;
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'tenantId' | 'createdAt' | 'active'>>;

export interface IProductRepository {
  subscribe(tenantId: string, callback: (products: Product[]) => void): () => void;
  getById(tenantId: string, id: string): Promise<Product | null>;
  create(tenantId: string, data: CreateProductInput): Promise<Product>;
  update(tenantId: string, id: string, data: UpdateProductInput): Promise<void>;
  remove(tenantId: string, id: string): Promise<void>;
}
