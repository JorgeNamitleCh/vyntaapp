import { Supplier } from '../../types';

export interface ISupplierRepository {
  create(tenantId: string, data: Omit<Supplier, 'id' | 'tenantId'>): Promise<Supplier>;
  update(tenantId: string, supplierId: string, data: Partial<Omit<Supplier, 'id' | 'tenantId'>>): Promise<void>;
  delete(tenantId: string, supplierId: string): Promise<void>;
  getAll(tenantId: string): Promise<Supplier[]>;
  subscribe(tenantId: string, cb: (suppliers: Supplier[]) => void): () => void;
}
