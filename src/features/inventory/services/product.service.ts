import { firebaseProductRepository } from '../../../repositories/firebase/product.repository';
import { CreateProductInput, UpdateProductInput } from '../../../repositories/interfaces/IProductRepository';
import { Product } from '../../../types';

const repo = firebaseProductRepository;

export const productService = {
  subscribe(tenantId: string, callback: (products: Product[]) => void): () => void {
    return repo.subscribe(tenantId, callback);
  },

  getById(tenantId: string, id: string): Promise<Product | null> {
    return repo.getById(tenantId, id);
  },

  create(tenantId: string, data: CreateProductInput): Promise<Product> {
    return repo.create(tenantId, data);
  },

  update(tenantId: string, id: string, data: UpdateProductInput): Promise<void> {
    return repo.update(tenantId, id, data);
  },

  remove(tenantId: string, id: string): Promise<void> {
    return repo.remove(tenantId, id);
  },
};
