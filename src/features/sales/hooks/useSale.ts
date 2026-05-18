import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useGoalsStore } from '../../../store/goalsStore';
import { salesService } from '../services/sales.service';
import { notificationsService } from '../../../services/notifications.service';
import { Sale, SaleItem } from '../../../types';

export type ConfirmSaleInput = {
  paymentMethod: Sale['paymentMethod'];
  channel: string;
};

export const useSale = () => {
  const tenant = useAuthStore(s => s.tenant);
  const user   = useAuthStore(s => s.user);
  const { items, note, discount } = useCartStore();

  return useMutation({
    mutationFn: async (input: ConfirmSaleInput): Promise<Sale> => {
      if (!tenant?.id || !user?.uid) throw new Error('Tenant or user not found');

      const saleItems: SaleItem[] = items.map(item => ({
        productId:   item.id,
        productName: item.name,
        quantity:    item.qty,
        unitPrice:   item.price,
        subtotal:    item.price * item.qty,
        ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
      }));

      const subtotal = saleItems.reduce((s, i) => s + i.subtotal, 0);

      const discountAmount = (() => {
        if (!discount) return 0;
        if (discount.type === 'percent') return Math.round(subtotal * discount.value / 100 * 100) / 100;
        return Math.min(discount.value, subtotal);
      })();

      const afterDiscount = subtotal - discountAmount;
      const total = Math.round(afterDiscount * 100) / 100;

      return salesService.registerSale({
        tenantId:       tenant.id,
        items:          saleItems,
        subtotal,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
        paymentMethod:  input.paymentMethod,
        channel:        input.channel,
        createdBy:      user.uid,
        note:           note || undefined,
      });
    },

    onSuccess: async (sale) => {
      const { dailyGoal, monthlyGoal } = useGoalsStore.getState();

      // Cash register effect always fires
      notificationsService.fireCashRegister(tenant!.id, sale.total).catch(() => {});

      try {
        // Fetch updated totals to check goals
        const [todaySales, monthSales] = await Promise.all([
          salesService.getTodaySales(tenant!.id),
          salesService.getSalesByDateRange(
            tenant!.id,
            (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; })(),
            (() => { const d = new Date(); d.setHours(23,59,59,999); return d; })(),
          ),
        ]);

        const todayTotal = todaySales.reduce((s, x) => s + x.total, 0);
        const monthTotal = monthSales.reduce((s, x) => s + x.total, 0);
        const prevDay    = todayTotal - sale.total;
        const prevMonth  = monthTotal - sale.total;

        // Cancel "no sales today" reminder — first sale of the day
        if (todaySales.length === 1) {
          notificationsService.cancelDailyReminder().catch(() => {});
        }

        // Daily goal just crossed
        if (dailyGoal && prevDay < dailyGoal && todayTotal >= dailyGoal) {
          notificationsService.fireDailyGoalReached(tenant!.id, todayTotal, dailyGoal).catch(() => {});
        }

        // Monthly goal just crossed
        if (monthlyGoal && prevMonth < monthlyGoal && monthTotal >= monthlyGoal) {
          notificationsService.fireMonthlyGoalReached(tenant!.id, monthTotal, monthlyGoal).catch(() => {});
        }
      } catch {
        // Never block a successful sale due to notification errors
      }
    },
  });
};
