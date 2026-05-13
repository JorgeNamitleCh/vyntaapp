import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS, TENANT_COLLECTIONS } from '../../config/firebase';
import { IProductRepository, CreateProductInput, UpdateProductInput } from '../interfaces/IProductRepository';
import { Product } from '../../types';

const toProduct = (doc: { id: string; data(): Record<string, any> | undefined }): Product => {
  const d = doc.data()!;
  return {
    id:           doc.id,
    tenantId:     d.tenantId,
    name:         d.name,
    price:        d.price,
    cost:         d.cost,
    stock:        d.stock ?? 0,
    unit:         d.unit ?? 'pza',
    category:     d.category,
    sku:          d.sku,
    barcode:      d.barcode,
    alertAt:      d.alertAt,
    controlStock: d.controlStock ?? true,
    imageUrl:     d.imageUrl,
    active:       d.active ?? true,
    createdAt:    d.createdAt?.toDate() ?? new Date(),
    updatedAt:    d.updatedAt?.toDate() ?? new Date(),
  };
};

const col = (tenantId: string) =>
  firestore()
    .collection(COLLECTIONS.TENANTS)
    .doc(tenantId)
    .collection(TENANT_COLLECTIONS.PRODUCTS);

export const firebaseProductRepository: IProductRepository = {
  subscribe(tenantId, callback) {
    return col(tenantId)
      .where('active', '==', true)
      .onSnapshot(
        snapshot => callback(
          snapshot.docs
            .map(toProduct)
            .sort((a, b) => a.name.localeCompare(b.name, 'es')),
        ),
        error => console.error('[products] onSnapshot error:', error),
      );
  },

  async getById(tenantId, id) {
    const doc = await col(tenantId).doc(id).get();
    return doc.exists ? toProduct(doc) : null;
  },

  async create(tenantId, data) {
    const ref = col(tenantId).doc();
    const now = firestore.FieldValue.serverTimestamp();
    await ref.set({ ...data, active: true, createdAt: now, updatedAt: now });
    return { id: ref.id, ...data, active: true, createdAt: new Date(), updatedAt: new Date() };
  },

  async update(tenantId, id, data) {
    await col(tenantId).doc(id).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  async remove(tenantId, id) {
    await col(tenantId).doc(id).update({
      active: false,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  },
};
