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

export type UpdateTenantParams = Partial<Pick<Tenant, 'name' | 'businessType' | 'logoUrl' | 'showPhone' | 'showAddress' | 'receiptFooter'>>;

export interface ITenantRepository {
  createTenantAndUser(params: CreateTenantParams): Promise<{ tenant: Tenant; user: User }>;
  updateTenant(tenantId: string, params: UpdateTenantParams): Promise<void>;
}
