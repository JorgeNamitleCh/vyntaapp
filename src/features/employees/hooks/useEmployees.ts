import { useEffect, useState } from 'react';
import { Employee } from '../../../types';
import { employeeService } from '../services/employee.service';
import { useAuthStore } from '../../../store/authStore';

export const useEmployees = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setIsLoading(true);
    const unsub = employeeService.subscribe(tenantId, data => {
      setEmployees(data);
      setIsLoading(false);
    });
    return unsub;
  }, [tenantId]);

  const addEmployee = async (data: { name: string; phone?: string; role: import('../../../types').EmployeeRole }) => {
    if (!tenantId) return;
    await employeeService.createEmployee(tenantId, data);
  };

  const removeEmployee = async (employeeId: string) => {
    if (!tenantId) return;
    await employeeService.deleteEmployee(tenantId, employeeId);
  };

  return { employees, isLoading, addEmployee, removeEmployee };
};
