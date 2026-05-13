import { ISalesRepository } from '../../../repositories/interfaces/ISalesRepository';
import { firebaseSalesRepository } from '../../../repositories/firebase/sales.repository';
import { Sale, SaleItem, DailySummary } from '../../../types';
import { startOfDay, endOfDay, format } from 'date-fns';

const repository: ISalesRepository = firebaseSalesRepository;

export type RegisterSaleParams = {
  tenantId: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount?: number;
  total: number;
  paymentMethod: Sale['paymentMethod'];
  channel?: string;
  createdBy: string;
  note?: string;
};

export const salesService = {
  async registerSale(params: RegisterSaleParams): Promise<Sale> {
    const { tenantId, ...saleData } = params;
    return repository.create(tenantId, saleData);
  },

  async getRecentSales(tenantId: string, limit = 50): Promise<Sale[]> {
    return repository.getAll(tenantId, limit);
  },

  async getTodaySales(tenantId: string): Promise<Sale[]> {
    const now = new Date();
    return repository.getByDateRange(tenantId, startOfDay(now), endOfDay(now));
  },

  async getSalesByDateRange(tenantId: string, from: Date, to: Date): Promise<Sale[]> {
    return repository.getByDateRange(tenantId, from, to);
  },

  async getDailySummary(tenantId: string, date: Date): Promise<DailySummary> {
    const sales = await repository.getByDateRange(
      tenantId,
      startOfDay(date),
      endOfDay(date),
    );
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalSales,
      totalExpenses: 0,
      profit: totalSales,
      salesCount: sales.length,
    };
  },

  async deleteSale(tenantId: string, saleId: string): Promise<void> {
    return repository.delete(tenantId, saleId);
  },
};
