import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { expenseService } from '../services/expense.service';
import { Expense } from '../../../types';

export type SaveExpenseInput = {
  description: string;
  amount: number;
  category: string;
  supplier?: string;
  note?: string;
  date: Date;
};

export const useSaveExpense = () => {
  const tenant = useAuthStore(s => s.tenant);
  const user   = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (input: SaveExpenseInput): Promise<Expense> => {
      if (!tenant?.id || !user?.uid) throw new Error('Tenant or user not found');
      return expenseService.saveExpense({
        tenantId:  tenant.id,
        createdBy: user.uid,
        ...input,
      });
    },
  });
};
