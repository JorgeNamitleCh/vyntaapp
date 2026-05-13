import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { productService } from '../services/product.service';
import { Product } from '../../../types';

export type SaveProductInput = {
  id?: string;
  name: string;
  price: number;
  cost?: number;
  stock: number;
  unit?: string;
  category?: string;
  sku?: string;
  barcode?: string;
  alertAt?: number;
  controlStock?: boolean;
  imageUrl?: string;
};

export const useSaveProduct = () => {
  const tenant = useAuthStore(s => s.tenant);

  return useMutation({
    mutationFn: async (input: SaveProductInput): Promise<Product | void> => {
      if (!tenant?.id) throw new Error('Tenant not found');

      const { id, ...fields } = input;
      const data = { ...fields, unit: fields.unit ?? 'pza', tenantId: tenant.id };

      if (id) {
        await productService.update(tenant.id, id, fields);
      } else {
        return productService.create(tenant.id, data);
      }
    },
  });
};
