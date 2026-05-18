import { firebaseEmployeeRepository } from '../../../repositories/firebase/employee.repository';
import { Employee, EmployeeRole } from '../../../types';

const repo = firebaseEmployeeRepository;

export const employeeService = {
  async createEmployee(tenantId: string, data: { name: string; phone?: string; role: EmployeeRole }): Promise<Employee> {
    return repo.create(tenantId, { ...data, createdAt: new Date() });
  },

  async updateEmployee(tenantId: string, employeeId: string, data: { name: string; phone?: string; role: EmployeeRole }): Promise<void> {
    return repo.update(tenantId, employeeId, data);
  },

  async deleteEmployee(tenantId: string, employeeId: string): Promise<void> {
    return repo.delete(tenantId, employeeId);
  },

  subscribe(tenantId: string, cb: (employees: Employee[]) => void) {
    return repo.subscribe(tenantId, cb);
  },
};
