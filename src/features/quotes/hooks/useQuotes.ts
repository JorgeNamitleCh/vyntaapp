import { useEffect, useState } from 'react';
import { Quote } from '../../../types';
import { quoteService } from '../services/quote.service';
import { useAuthStore } from '../../../store/authStore';

export const useQuotes = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsub = quoteService.subscribe(tenantId, data => {
      setQuotes(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenantId]);

  const deleteQuote = async (quoteId: string) => {
    if (!tenantId) return;
    await quoteService.deleteQuote(tenantId, quoteId);
  };

  return { quotes, isLoading, deleteQuote };
};
