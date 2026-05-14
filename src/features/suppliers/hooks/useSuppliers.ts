import { useEffect, useState } from 'react';
import { Supplier } from '../../../types';
import { supplierService } from '../services/supplier.service';
import { useAuthStore } from '../../../store/authStore';

export const useSuppliers = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsub = supplierService.subscribe(tenantId, data => {
      setSuppliers(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenantId]);

  const addSupplier = async (data: { name: string; phone?: string; email?: string; category?: string; note?: string }) => {
    if (!tenantId) return;
    await supplierService.createSupplier(tenantId, data);
  };

  const removeSupplier = async (supplierId: string) => {
    if (!tenantId) return;
    await supplierService.deleteSupplier(tenantId, supplierId);
  };

  return { suppliers, isLoading, addSupplier, removeSupplier };
};
