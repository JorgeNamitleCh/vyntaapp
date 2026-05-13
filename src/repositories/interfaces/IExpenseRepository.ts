import { Expense } from '../../types';

export interface IExpenseRepository {
  create(tenantId: string, data: Omit<Expense, 'id' | 'tenantId'>): Promise<Expense>;
  subscribe(
    tenantId: string,
    from: Date,
    to: Date,
    cb: (expenses: Expense[]) => void,
  ): () => void;
  getByDateRange(tenantId: string, from: Date, to: Date): Promise<Expense[]>;
  delete(tenantId: string, expenseId: string): Promise<void>;
}
