import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { expenseService } from '../services/expense.service';
import { Expense } from '../../../types';

export const useExpenses = (monthDate: Date) => {
  const tenant = useAuthStore(s => s.tenant);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    setIsLoading(true);
    const unsub = expenseService.subscribeByMonth(tenant.id, monthDate, data => {
      setExpenses(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenant?.id, monthDate.getFullYear(), monthDate.getMonth()]);

  return { expenses, isLoading };
};
