import { useState } from 'react';
import { tenantService } from '../services/tenant.service';
import { useAuthStore } from '../../../store/authStore';
import { toast } from '../../../store/toastStore';
import { VatMode } from '../../../types';

interface CreateBusinessInput {
  businessName: string;
  businessType?: string | null;
  channels?: string[];
  vatMode?: VatMode;
  paymentMethods?: string[];
  currency?: string;
}

export const useCreateBusiness = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = async (input: CreateBusinessInput): Promise<boolean> => {
    if (!user?.uid) return false;
    setError(null);
    setIsLoading(true);
    try {
      await tenantService.createBusiness({
        uid: user.uid,
        phone: user.phone,
        ...input,
        businessName: input.businessName.trim(),
      });
      toast.success('¡Negocio creado!', input.businessName.trim());
      return true;
    } catch (e: any) {
      const msg = e?.message ?? 'Error al crear el negocio';
      setError(msg);
      toast.error('Error al crear el negocio', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createBusiness, isLoading, error };
};
