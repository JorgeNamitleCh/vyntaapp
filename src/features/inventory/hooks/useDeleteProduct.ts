import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { productService } from '../services/product.service';

export const useDeleteProduct = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);

  return useMutation({
    mutationFn: (productId: string) => {
      if (!tenantId) throw new Error('Tenant not found');
      return productService.remove(tenantId, productId);
    },
  });
};
