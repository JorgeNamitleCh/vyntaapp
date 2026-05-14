import { useEffect, useState } from 'react';
import { Customer } from '../../../types';
import { customerService } from '../services/customer.service';
import { useAuthStore } from '../../../store/authStore';

export const useCustomers = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsub = customerService.subscribe(tenantId, data => {
      setCustomers(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenantId]);

  const deleteCustomer = async (customerId: string) => {
    if (!tenantId) return;
    await customerService.deleteCustomer(tenantId, customerId);
  };

  return { customers, isLoading, deleteCustomer };
};
