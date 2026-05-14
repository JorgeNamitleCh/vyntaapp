import { firebaseCustomerRepository } from '../../../repositories/firebase/customer.repository';
import { Customer } from '../../../types';

const repo = firebaseCustomerRepository;

export const customerService = {
  async createCustomer(tenantId: string, data: { name: string; phone?: string; email?: string; note?: string }): Promise<Customer> {
    return repo.create(tenantId, { ...data, createdAt: new Date() });
  },

  async updateCustomer(tenantId: string, customerId: string, data: Partial<Pick<Customer, 'name' | 'phone' | 'email' | 'note'>>): Promise<void> {
    return repo.update(tenantId, customerId, data);
  },

  async deleteCustomer(tenantId: string, customerId: string): Promise<void> {
    return repo.delete(tenantId, customerId);
  },

  async getAll(tenantId: string): Promise<Customer[]> {
    return repo.getAll(tenantId);
  },

  subscribe(tenantId: string, cb: (customers: Customer[]) => void) {
    return repo.subscribe(tenantId, cb);
  },
};
