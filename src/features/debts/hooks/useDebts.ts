import { useEffect, useState } from 'react';
import { Debt, DebtType } from '../../../types';
import { debtService } from '../services/debt.service';
import { useAuthStore } from '../../../store/authStore';

export const useDebts = (type: DebtType) => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsub = debtService.subscribeByType(tenantId, type, data => {
      setDebts(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenantId, type]);

  const recordPayment = async (debt: Debt, amount: number) => {
    if (!tenantId) return;
    await debtService.recordPayment(tenantId, debt, amount);
  };

  const deleteDebt = async (debtId: string) => {
    if (!tenantId) return;
    await debtService.deleteDebt(tenantId, debtId);
  };

  return { debts, isLoading, recordPayment, deleteDebt };
};
