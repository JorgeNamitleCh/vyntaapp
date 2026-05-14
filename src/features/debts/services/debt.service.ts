import { firebaseDebtRepository } from '../../../repositories/firebase/debt.repository';
import { Debt, DebtType } from '../../../types';

const repo = firebaseDebtRepository;

export type CreateDebtParams = {
  tenantId: string;
  type: DebtType;
  amount: number;
  description: string;
  entityName: string;
  entityId?: string;
  dueDate?: Date;
  note?: string;
  createdBy: string;
};

export const debtService = {
  async createDebt(params: CreateDebtParams): Promise<Debt> {
    const { tenantId, ...rest } = params;
    return repo.create(tenantId, {
      ...rest,
      paidAmount: 0,
      status: 'pending',
      createdAt: new Date(),
    });
  },

  async recordPayment(tenantId: string, debt: Debt, paymentAmount: number): Promise<void> {
    const newPaid = Math.min(debt.amount, debt.paidAmount + paymentAmount);
    const status: Debt['status'] = newPaid >= debt.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
    return repo.update(tenantId, debt.id, { paidAmount: newPaid, status });
  },

  async deleteDebt(tenantId: string, debtId: string): Promise<void> {
    return repo.delete(tenantId, debtId);
  },

  subscribeByType(tenantId: string, type: DebtType, cb: (debts: Debt[]) => void) {
    return repo.subscribeByType(tenantId, type, cb);
  },
};
