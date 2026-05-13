import { firebaseTenantRepository } from '../../../repositories/firebase/tenant.repository';
import { CreateTenantParams } from '../../../repositories/interfaces/ITenantRepository';
import { useAuthStore } from '../../../store/authStore';

const repository = firebaseTenantRepository;

export const tenantService = {
  async createBusiness(params: CreateTenantParams): Promise<void> {
    const { tenant, user } = await repository.createTenantAndUser(params);
    const { setUser, setTenant } = useAuthStore.getState();
    setUser(user);
    setTenant(tenant);
  },
};
