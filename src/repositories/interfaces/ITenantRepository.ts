import { Tenant, User, VatMode } from '../../types';

export interface CreateTenantParams {
  uid: string;
  phone?: string;
  businessName: string;
  businessType?: string | null;
  channels?: string[];
  vatMode?: VatMode;
  paymentMethods?: string[];
  currency?: string;
}

export interface ITenantRepository {
  createTenantAndUser(params: CreateTenantParams): Promise<{ tenant: Tenant; user: User }>;
}
