import { firebaseExpenseRepository } from '../../../repositories/firebase/expense.repository';
import { IExpenseRepository } from '../../../repositories/interfaces/IExpenseRepository';
import { Expense } from '../../../types';
import { startOfMonth, endOfMonth } from 'date-fns';

const repository: IExpenseRepository = firebaseExpenseRepository;

export type SaveExpenseParams = {
  tenantId: string;
  description: string;
  amount: number;
  category: string;
  supplier?: string;
  note?: string;
  date: Date;
  createdBy: string;
};

export const expenseService = {
  async saveExpense(params: SaveExpenseParams): Promise<Expense> {
    const { tenantId, date, ...rest } = params;
    return repository.create(tenantId, { ...rest, createdAt: date });
  },

  subscribeByMonth(
    tenantId: string,
    monthDate: Date,
    cb: (expenses: Expense[]) => void,
  ) {
    return repository.subscribe(
      tenantId,
      startOfMonth(monthDate),
      endOfMonth(monthDate),
      cb,
    );
  },

  async getByDateRange(tenantId: string, from: Date, to: Date): Promise<Expense[]> {
    return repository.getByDateRange(tenantId, from, to);
  },

  async deleteExpense(tenantId: string, expenseId: string): Promise<void> {
    return repository.delete(tenantId, expenseId);
  },
};
