import firestore from '@react-native-firebase/firestore';
import { Supplier } from '../../types';
import { ISupplierRepository } from '../interfaces/ISupplierRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection(TENANT_COLLECTIONS.SUPPLIERS);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toSupplier = (doc: { id: string; data(): Record<string, any> | undefined }): Supplier => {
  const d = doc.data()!;
  return {
    id:        doc.id,
    tenantId:  d.tenantId,
    name:      d.name,
    phone:     d.phone,
    email:     d.email,
    category:  d.category,
    note:      d.note,
    createdAt: d.createdAt?.toDate() ?? new Date(),
  };
};

export const firebaseSupplierRepository: ISupplierRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const supplier: Supplier = { ...data, id: ref.id, tenantId };
    await ref.set(clean({ ...data, tenantId, id: ref.id, createdAt: firestore.Timestamp.fromDate(data.createdAt) }));
    return supplier;
  },

  async update(tenantId, supplierId, data) {
    await col(tenantId).doc(supplierId).update(clean(data));
  },

  async delete(tenantId, supplierId) {
    await col(tenantId).doc(supplierId).delete();
  },

  async getAll(tenantId) {
    const snap = await col(tenantId).orderBy('name').get();
    return snap.docs.map(toSupplier);
  },

  subscribe(tenantId, cb) {
    return col(tenantId).orderBy('name').onSnapshot(
      snap => cb(snap.docs.map(toSupplier)),
      err => console.error('[supplier.subscribe]', err),
    );
  },
};
