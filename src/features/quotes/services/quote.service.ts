import { addWeeks, addDays, addMonths } from 'date-fns';
import { firebaseQuoteRepository } from '../../../repositories/firebase/quote.repository';
import { Quote, QuoteExpiration, QuoteItem } from '../../../types';

const repo = firebaseQuoteRepository;

const getExpiresAt = (expiration: QuoteExpiration, from: Date): Date | undefined => {
  if (expiration === 'week') return addWeeks(from, 1);
  if (expiration === '15days') return addDays(from, 15);
  if (expiration === 'month') return addMonths(from, 1);
  return undefined;
};

export type CreateQuoteParams = {
  tenantId: string;
  type: 'products' | 'free';
  items: QuoteItem[];
  discountPct: number;
  customerId?: string;
  customerName: string;
  concept: string;
  expiration: QuoteExpiration;
  footerNote?: string;
  createdBy: string;
};

export const quoteService = {
  async createQuote(params: CreateQuoteParams): Promise<Quote> {
    const { tenantId, items, discountPct, ...rest } = params;
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const discountAmount = Math.round(subtotal * discountPct / 100 * 100) / 100;
    const total = subtotal - discountAmount;
    const now = new Date();
    const expiresAt = getExpiresAt(rest.expiration, now);

    return repo.create(tenantId, {
      ...rest,
      items,
      subtotal,
      discountPct,
      discountAmount,
      total,
      expiresAt,
      status: 'pending',
      createdAt: now,
    });
  },

  async updateStatus(tenantId: string, quoteId: string, status: Quote['status']): Promise<void> {
    return repo.update(tenantId, quoteId, { status });
  },

  async deleteQuote(tenantId: string, quoteId: string): Promise<void> {
    return repo.delete(tenantId, quoteId);
  },

  subscribe(tenantId: string, cb: (quotes: Quote[]) => void) {
    return repo.subscribe(tenantId, cb);
  },
};
