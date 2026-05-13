import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { salesService } from '../services/sales.service';
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
      }));

      const subtotal = saleItems.reduce((s, i) => s + i.subtotal, 0);

      const discountAmount = (() => {
        if (!discount) return 0;
        if (discount.type === 'percent') return Math.round(subtotal * discount.value / 100 * 100) / 100;
        return Math.min(discount.value, subtotal);
      })();

      const afterDiscount = subtotal - discountAmount;
      const total = Math.round((afterDiscount + afterDiscount * 0.16) * 100) / 100;

      return salesService.registerSale({
        tenantId:      tenant.id,
        items:         saleItems,
        subtotal,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
        paymentMethod: input.paymentMethod,
        channel:       input.channel,
        createdBy:     user.uid,
        note:          note || undefined,
      });
    },
  });
};
