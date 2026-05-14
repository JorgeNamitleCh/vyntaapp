import firestore from '@react-native-firebase/firestore';
import { Quote } from '../../types';
import { IQuoteRepository } from '../interfaces/IQuoteRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection(TENANT_COLLECTIONS.QUOTES);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toQuote = (doc: { id: string; data(): Record<string, any> | undefined }): Quote => {
  const d = doc.data()!;
  return {
    id:             doc.id,
    tenantId:       d.tenantId,
    type:           d.type,
    items:          d.items ?? [],
    subtotal:       d.subtotal,
    discountPct:    d.discountPct,
    discountAmount: d.discountAmount,
    total:          d.total,
    customerId:     d.customerId,
    customerName:   d.customerName,
    concept:        d.concept,
    expiration:     d.expiration,
    expiresAt:      d.expiresAt?.toDate(),
    status:         d.status,
    footerNote:     d.footerNote,
    createdAt:      d.createdAt?.toDate() ?? new Date(),
    createdBy:      d.createdBy,
  };
};

export const firebaseQuoteRepository: IQuoteRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const quote: Quote = { ...data, id: ref.id, tenantId };
    const payload: Record<string, any> = {
      ...data, tenantId, id: ref.id,
      createdAt: firestore.Timestamp.fromDate(data.createdAt),
    };
    if (data.expiresAt) payload.expiresAt = firestore.Timestamp.fromDate(data.expiresAt);
    await ref.set(clean(payload));
    return quote;
  },

  async update(tenantId, quoteId, data) {
    await col(tenantId).doc(quoteId).update(clean(data));
  },

  async delete(tenantId, quoteId) {
    await col(tenantId).doc(quoteId).delete();
  },

  subscribe(tenantId, cb) {
    return col(tenantId).orderBy('createdAt', 'desc').onSnapshot(
      snap => cb(snap.docs.map(toQuote)),
      err => console.error('[quote.subscribe]', err),
    );
  },
};
