// src/features/sales/hooks/useSales.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import { Sale, SaleItem } from '../../../types';

const SALES_KEY = (tenantId: string) => ['sales', tenantId];
const TODAY_KEY = (tenantId: string) => ['sales', tenantId, 'today'];

export const useSales = (tenantId: string) => {
  return useQuery({
    queryKey: SALES_KEY(tenantId),
    queryFn: () => salesService.getRecentSales(tenantId),
    enabled: !!tenantId,
  });
};

export const useTodaySales = (tenantId: string) => {
  return useQuery({
    queryKey: TODAY_KEY(tenantId),
    queryFn: () => salesService.getTodaySales(tenantId),
    enabled: !!tenantId,
  });
};

export const useRegisterSale = (tenantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      items,
      paymentMethod,
      createdBy,
      note,
    }: {
      items: SaleItem[];
      paymentMethod: Sale['paymentMethod'];
      createdBy: string;
      note?: string;
    }) => salesService.registerSale({ tenantId, items, paymentMethod, createdBy, note, subtotal: items.reduce((s, i) => s + i.subtotal, 0), total: items.reduce((s, i) => s + i.subtotal, 0) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY(tenantId) });
      queryClient.invalidateQueries({ queryKey: TODAY_KEY(tenantId) });
    },
  });
};
