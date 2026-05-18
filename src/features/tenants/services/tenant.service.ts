import { firebaseTenantRepository } from '../../../repositories/firebase/tenant.repository';
import { CreateTenantParams, UpdateTenantParams } from '../../../repositories/interfaces/ITenantRepository';
import { useAuthStore } from '../../../store/authStore';

const repository = firebaseTenantRepository;

export const tenantService = {
  async createBusiness(params: CreateTenantParams): Promise<void> {
    const { tenant, user } = await repository.createTenantAndUser(params);
    const { setUser, setTenant } = useAuthStore.getState();
    setUser(user);
    setTenant(tenant);
  },

  async updateTenant(tenantId: string, params: UpdateTenantParams): Promise<void> {
    await repository.updateTenant(tenantId, params);
    const { tenant, setTenant } = useAuthStore.getState();
    if (tenant) setTenant({ ...tenant, ...params });
  },
};
