import { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { productService } from '../services/product.service';
import { useAuthStore } from '../../../store/authStore';

export const useProducts = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = productService.subscribe(tenantId, prods => {
      setProducts(prods);
      setIsLoading(false);
      setError(null);
    });
    return unsubscribe;
  }, [tenantId]);

  return { products, isLoading, error };
};
