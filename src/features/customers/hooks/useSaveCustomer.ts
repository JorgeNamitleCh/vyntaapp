import { useState } from 'react';
import { customerService } from '../services/customer.service';
import { useAuthStore } from '../../../store/authStore';

export const useSaveCustomer = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (data: { name: string; phone?: string; email?: string; note?: string }, customerId?: string) => {
    if (!tenantId) return;
    setIsSaving(true);
    try {
      if (customerId) {
        await customerService.updateCustomer(tenantId, customerId, data);
      } else {
        await customerService.createCustomer(tenantId, data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
};
