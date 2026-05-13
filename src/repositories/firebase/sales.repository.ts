import firestore from '@react-native-firebase/firestore';
import { Sale } from '../../types';
import { ISalesRepository } from '../interfaces/ISalesRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore()
    .collection(COLLECTIONS.TENANTS)
    .doc(tenantId)
    .collection(TENANT_COLLECTIONS.SALES);

const toSale = (doc: { id: string; data(): Record<string, any> | undefined }): Sale => {
  const d = doc.data()!;
  return {
    id:             doc.id,
    tenantId:       d.tenantId,
    items:          d.items ?? [],
    subtotal:       d.subtotal ?? d.total,
    discountAmount: d.discountAmount,
    total:          d.total,
    paymentMethod:  d.paymentMethod,
    channel:        d.channel,
    note:           d.note,
    createdBy:      d.createdBy,
    createdAt:      d.createdAt?.toDate() ?? new Date(),
  };
};

export const firebaseSalesRepository: ISalesRepository = {
  async create(tenantId, saleData) {
    const ref = col(tenantId).doc();
    const now = firestore.FieldValue.serverTimestamp();
    const sale: Sale = {
      ...saleData,
      id: ref.id,
      tenantId,
      createdAt: new Date(),
    };
    await ref.set({ ...saleData, tenantId, id: ref.id, createdAt: now });
    return sale;
  },

  async getAll(tenantId, limit = 50) {
    const snap = await col(tenantId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(toSale);
  },

  async getByDateRange(tenantId, from, to) {
    const snap = await col(tenantId)
      .where('createdAt', '>=', firestore.Timestamp.fromDate(from))
      .where('createdAt', '<=', firestore.Timestamp.fromDate(to))
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(toSale);
  },

  async getById(tenantId, saleId) {
    const doc = await col(tenantId).doc(saleId).get();
    if (!doc.exists) return null;
    return toSale(doc);
  },

  async delete(tenantId, saleId) {
    await col(tenantId).doc(saleId).delete();
  },
};
