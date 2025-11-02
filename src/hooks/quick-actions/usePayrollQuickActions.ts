
/**
 * Payroll Quick Actions Hook
 * Handles payroll-related quick actions
 */

import { useToast } from "@/hooks/use-toast";
import { useEmployeeData } from "@/hooks/useEmployeeData";

export const usePayrollQuickActions = () => {
  const { toast } = useToast();
  const { allEmployees } = useEmployeeData();

  const handleProcessPayroll = () => {
    const activeEmployees = allEmployees.filter(emp => emp.status === 'Active');
    
    if (activeEmployees.length === 0) {
      toast({
        title: "No Active Employees",
        description: "No active employees found for payroll processing.",
        variant: "destructive"
      });
      return;
    }

    console.log('Processing payroll for employees:', activeEmployees.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      baseSalary: emp.baseSalary
    })));

    toast({
      title: "Payroll Processing Started",
      description: `Payroll for ${activeEmployees.length} active employees is being processed from main records. You will be notified when complete.`,
    });
  };

  return {
    handleProcessPayroll
  };
};
