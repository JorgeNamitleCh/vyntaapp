import firestore from '@react-native-firebase/firestore';
import { Expense } from '../../types';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore()
    .collection(COLLECTIONS.TENANTS)
    .doc(tenantId)
    .collection(TENANT_COLLECTIONS.EXPENSES);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toExpense = (doc: { id: string; data(): Record<string, any> | undefined }): Expense => {
  const d = doc.data()!;
  return {
    id:          doc.id,
    tenantId:    d.tenantId,
    description: d.description,
    amount:      d.amount,
    category:    d.category,
    supplier:    d.supplier,
    note:        d.note,
    createdBy:   d.createdBy,
    createdAt:   d.createdAt?.toDate() ?? new Date(),
  };
};

export const firebaseExpenseRepository: IExpenseRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const expense: Expense = { ...data, id: ref.id, tenantId };
    await ref.set(clean({ ...data, tenantId, id: ref.id, createdAt: firestore.Timestamp.fromDate(data.createdAt) }));
    return expense;
  },

  subscribe(tenantId, from, to, cb) {
    const unsub = col(tenantId)
      .where('createdAt', '>=', firestore.Timestamp.fromDate(from))
      .where('createdAt', '<=', firestore.Timestamp.fromDate(to))
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => cb(snap.docs.map(toExpense)),
        err => console.error('[expense.subscribe]', err),
      );
    return unsub;
  },

  async getByDateRange(tenantId, from, to) {
    const snap = await col(tenantId)
      .where('createdAt', '>=', firestore.Timestamp.fromDate(from))
      .where('createdAt', '<=', firestore.Timestamp.fromDate(to))
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(toExpense);
  },

  async delete(tenantId, expenseId) {
    await col(tenantId).doc(expenseId).delete();
  },
};
