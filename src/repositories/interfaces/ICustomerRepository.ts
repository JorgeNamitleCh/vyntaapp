import { Customer } from '../../types';

export interface ICustomerRepository {
  create(tenantId: string, data: Omit<Customer, 'id' | 'tenantId'>): Promise<Customer>;
  update(tenantId: string, customerId: string, data: Partial<Omit<Customer, 'id' | 'tenantId'>>): Promise<void>;
  delete(tenantId: string, customerId: string): Promise<void>;
  getAll(tenantId: string): Promise<Customer[]>;
  subscribe(tenantId: string, cb: (customers: Customer[]) => void): () => void;
}
