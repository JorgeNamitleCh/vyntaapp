import { Quote } from '../../types';

export interface IQuoteRepository {
  create(tenantId: string, data: Omit<Quote, 'id' | 'tenantId'>): Promise<Quote>;
  update(tenantId: string, quoteId: string, data: Partial<Omit<Quote, 'id' | 'tenantId'>>): Promise<void>;
  delete(tenantId: string, quoteId: string): Promise<void>;
  subscribe(tenantId: string, cb: (quotes: Quote[]) => void): () => void;
}
