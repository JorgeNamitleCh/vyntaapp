import firestore from '@react-native-firebase/firestore';
import { Customer } from '../../types';
import { ICustomerRepository } from '../interfaces/ICustomerRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection(TENANT_COLLECTIONS.CUSTOMERS);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toCustomer = (doc: { id: string; data(): Record<string, any> | undefined }): Customer => {
  const d = doc.data()!;
  return {
    id:        doc.id,
    tenantId:  d.tenantId,
    name:      d.name,
    phone:     d.phone,
    email:     d.email,
    note:      d.note,
    createdAt: d.createdAt?.toDate() ?? new Date(),
  };
};

export const firebaseCustomerRepository: ICustomerRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const customer: Customer = { ...data, id: ref.id, tenantId };
    await ref.set(clean({ ...data, tenantId, id: ref.id, createdAt: firestore.Timestamp.fromDate(data.createdAt) }));
    return customer;
  },

  async update(tenantId, customerId, data) {
    await col(tenantId).doc(customerId).update(clean(data));
  },

  async delete(tenantId, customerId) {
    await col(tenantId).doc(customerId).delete();
  },

  async getAll(tenantId) {
    const snap = await col(tenantId).orderBy('name').get();
    return snap.docs.map(toCustomer);
  },

  subscribe(tenantId, cb) {
    return col(tenantId).orderBy('name').onSnapshot(
      snap => cb(snap.docs.map(toCustomer)),
      err => console.error('[customer.subscribe]', err),
    );
  },
};
