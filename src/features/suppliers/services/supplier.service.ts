import { firebaseSupplierRepository } from '../../../repositories/firebase/supplier.repository';
import { Supplier } from '../../../types';

const repo = firebaseSupplierRepository;

export const supplierService = {
  async createSupplier(tenantId: string, data: { name: string; phone?: string; email?: string; category?: string; note?: string }): Promise<Supplier> {
    return repo.create(tenantId, { ...data, createdAt: new Date() });
  },

  async updateSupplier(tenantId: string, supplierId: string, data: Partial<Pick<Supplier, 'name' | 'phone' | 'email' | 'category' | 'note'>>): Promise<void> {
    return repo.update(tenantId, supplierId, data);
  },

  async deleteSupplier(tenantId: string, supplierId: string): Promise<void> {
    return repo.delete(tenantId, supplierId);
  },

  subscribe(tenantId: string, cb: (suppliers: Supplier[]) => void) {
    return repo.subscribe(tenantId, cb);
  },
};
