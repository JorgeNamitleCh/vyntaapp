import { Debt, DebtType } from '../../types';

export interface IDebtRepository {
  create(tenantId: string, data: Omit<Debt, 'id' | 'tenantId'>): Promise<Debt>;
  update(tenantId: string, debtId: string, data: Partial<Omit<Debt, 'id' | 'tenantId'>>): Promise<void>;
  delete(tenantId: string, debtId: string): Promise<void>;
  subscribeByType(tenantId: string, type: DebtType, cb: (debts: Debt[]) => void): () => void;
}
