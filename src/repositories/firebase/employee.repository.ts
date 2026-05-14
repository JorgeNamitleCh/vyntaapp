import firestore from '@react-native-firebase/firestore';
import { Employee } from '../../types';
import { IEmployeeRepository } from '../interfaces/IEmployeeRepository';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection(TENANT_COLLECTIONS.EMPLOYEES);

const clean = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const toEmployee = (doc: { id: string; data(): Record<string, any> | undefined }): Employee => {
  const d = doc.data()!;
  return {
    id:        doc.id,
    tenantId:  d.tenantId,
    name:      d.name,
    phone:     d.phone,
    role:      d.role,
    createdAt: d.createdAt?.toDate() ?? new Date(),
  };
};

export const firebaseEmployeeRepository: IEmployeeRepository = {
  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const employee: Employee = { ...data, id: ref.id, tenantId };
    await ref.set(clean({ ...data, tenantId, id: ref.id, createdAt: firestore.Timestamp.fromDate(data.createdAt) }));
    return employee;
  },

  async update(tenantId, employeeId, data) {
    await col(tenantId).doc(employeeId).update(clean(data));
  },

  async delete(tenantId, employeeId) {
    await col(tenantId).doc(employeeId).delete();
  },

  subscribe(tenantId, cb) {
    return col(tenantId).orderBy('name').onSnapshot(
      snap => cb(snap.docs.map(toEmployee)),
      err => console.error('[employee.subscribe]', err),
    );
  },
};
