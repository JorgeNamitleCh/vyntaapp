import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/authStore';

export const useAuth = () => {
  const { user, tenant, isLoading } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (phoneNumber: string): Promise<string | null> => {
    setError(null);
    setIsSending(true);
    try {
      return await authService.sendOtp(phoneNumber);
    } catch (e: any) {
      setError(e?.message ?? 'Error enviando código');
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async (
    verificationId: string,
    code: string,
  ): Promise<{ isNewUser: boolean } | null> => {
    setError(null);
    setIsVerifying(true);
    try {
      return await authService.verifyOtp(verificationId, code);
    } catch (e: any) {
      setError(e?.message ?? 'Código incorrecto');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  const signOut = () => authService.signOut();

  return {
    user,
    tenant,
    isLoading,
    isSending,
    isVerifying,
    error,
    sendOtp,
    verifyOtp,
    signOut,
  };
};
