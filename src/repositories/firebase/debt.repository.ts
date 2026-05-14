import firestore from '@react-native-firebase/firestore';
import { Debt, DebtType } from '../../types';
import { IDebtRepository } from '../interfaces/IDebtRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection(TENANT_COLLECTIONS.DEBTS);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toDebt = (doc: { id: string; data(): Record<string, any> | undefined }): Debt => {
  const d = doc.data()!;
  return {
    id:          doc.id,
    tenantId:    d.tenantId,
    type:        d.type,
    amount:      d.amount,
    paidAmount:  d.paidAmount ?? 0,
    description: d.description,
    entityName:  d.entityName,
    entityId:    d.entityId,
    dueDate:     d.dueDate?.toDate(),
    status:      d.status,
    note:        d.note,
    createdAt:   d.createdAt?.toDate() ?? new Date(),
    createdBy:   d.createdBy,
  };
};

export const firebaseDebtRepository: IDebtRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const debt: Debt = { ...data, id: ref.id, tenantId };
    const payload: Record<string, any> = {
      ...data, tenantId, id: ref.id,
      createdAt: firestore.Timestamp.fromDate(data.createdAt),
    };
    if (data.dueDate) payload.dueDate = firestore.Timestamp.fromDate(data.dueDate);
    await ref.set(clean(payload));
    return debt;
  },

  async update(tenantId, debtId, data) {
    await col(tenantId).doc(debtId).update(clean(data));
  },

  async delete(tenantId, debtId) {
    await col(tenantId).doc(debtId).delete();
  },

  subscribeByType(tenantId, type, cb) {
    return col(tenantId)
      .where('type', '==', type)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => cb(snap.docs.map(toDebt)),
        err => console.error('[debt.subscribe]', err),
      );
  },
};
