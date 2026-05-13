import { Sale } from '../../types';

export interface ISalesRepository {
  create(tenantId: string, data: Omit<Sale, 'id' | 'tenantId' | 'createdAt'>): Promise<Sale>;
  getAll(tenantId: string, limit?: number): Promise<Sale[]>;
  getByDateRange(tenantId: string, from: Date, to: Date): Promise<Sale[]>;
  getById(tenantId: string, saleId: string): Promise<Sale | null>;
  delete(tenantId: string, saleId: string): Promise<void>;
}
