import { Employee } from '../../types';

export interface IEmployeeRepository {
  create(tenantId: string, data: Omit<Employee, 'id' | 'tenantId'>): Promise<Employee>;
  update(tenantId: string, employeeId: string, data: Partial<Omit<Employee, 'id' | 'tenantId'>>): Promise<void>;
  delete(tenantId: string, employeeId: string): Promise<void>;
  subscribe(tenantId: string, cb: (employees: Employee[]) => void): () => void;
}
