import firestore from '@react-native-firebase/firestore';
import { ITenantRepository, CreateTenantParams, UpdateTenantParams } from '../interfaces/ITenantRepository';
import { Tenant, User } from '../../types';
import { COLLECTIONS } from '../../config/firebase';

export const firebaseTenantRepository: ITenantRepository = {
  async createTenantAndUser({
    uid,
    phone,
    businessName,
    businessType,
    channels,
    vatMode,
    paymentMethods,
    currency,
  }: CreateTenantParams) {
    const tenantRef = firestore().collection(COLLECTIONS.TENANTS).doc();
    const tenantId = tenantRef.id;

    const batch = firestore().batch();

    batch.set(tenantRef, {
      name: businessName,
      ownerId: uid,
      plan: 'free',
      createdAt: firestore.FieldValue.serverTimestamp(),
      ...(businessType && { businessType }),
      channels: channels ?? [],
      vatMode: vatMode ?? 'included',
      paymentMethods: paymentMethods ?? ['cash'],
      currency: currency ?? 'MXN',
    });

    batch.set(firestore().collection(COLLECTIONS.USERS).doc(uid), {
      uid,
      phone: phone ?? null,
      tenantId,
    });

    await batch.commit();

    const tenant: Tenant = {
      id: tenantId,
      name: businessName,
      ownerId: uid,
      plan: 'free',
      createdAt: new Date(),
      businessType: businessType ?? undefined,
      channels: channels ?? [],
      vatMode: vatMode ?? 'included',
      paymentMethods: paymentMethods ?? ['cash'],
      currency: currency ?? 'MXN',
    };

    const user: User = { uid, phone, tenantId };

    return { tenant, user };
  },

  async updateTenant(tenantId: string, params: UpdateTenantParams): Promise<void> {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined),
    );
    await firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).update(clean);
  },
};
