
/**
 * Employee CRUD operations hook
 * Handles create, update, delete operations for employees using direct table operations
 */

import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/hooks/useEmployeeData';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeCRUD = (refreshEmployees: () => Promise<void>) => {
  const { toast } = useToast();

  const addEmployee = async (employeeData: Partial<Employee>) => {
    try {
      console.log('➕ Adding new employee to Lovable Cloud:', employeeData.email);

      // Create the main employee record
      const { data: newEmployee, error: employeeError } = await supabase
        .from('employees')
        .insert({
          full_name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          department: employeeData.department,
          position: employeeData.role,
          status: employeeData.status || 'Active',
          join_date: employeeData.joinDate,
          address: employeeData.address,
          date_of_birth: employeeData.dateOfBirth,
          profile_picture_url: employeeData.profilePicture,
          manager: employeeData.manager,
          base_salary: employeeData.baseSalary
        })
        .select()
        .single();

      if (employeeError) {
        console.error('❌ Error creating employee:', employeeError);
        throw employeeError;
      }

      // Add emergency contact if provided
      if (employeeData.emergencyContact?.name && newEmployee?.id) {
        const { error: contactError } = await supabase
          .from('employee_emergency_contacts')
          .insert({
            employee_id: newEmployee.id,
            name: employeeData.emergencyContact.name,
            phone: employeeData.emergencyContact.phone,
            relationship: employeeData.emergencyContact.relationship
          });

        if (contactError) {
          console.error('❌ Error adding emergency contact:', contactError);
        }
      }

      // Add initial employment history record
      if (newEmployee?.id) {
        const { error: historyError } = await supabase
          .from('employee_employment_history')
          .insert({
            employee_id: newEmployee.id,
            title: employeeData.role!,
            department: employeeData.department!,
            start_date: employeeData.joinDate!,
            is_current: true
          });

        if (historyError) {
          console.error('❌ Error adding employment history:', historyError);
        }
      }

      await refreshEmployees();
      
      toast({
        title: "Success",
        description: `Employee ${employeeData.name} added successfully`,
      });

    } catch (error: any) {
      console.error('💥 Error adding employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      console.log('✏️ Updating employee in Lovable Cloud:', employeeId);

      // Update the main employee record
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          full_name: updates.name,
          email: updates.email,
          phone: updates.phone,
          department: updates.department,
          position: updates.role,
          status: updates.status,
          join_date: updates.joinDate,
          address: updates.address,
          date_of_birth: updates.dateOfBirth,
          profile_picture_url: updates.profilePicture,
          manager: updates.manager,
          base_salary: updates.baseSalary
        })
        .eq('id', employeeId);

      if (employeeError) {
        console.error('❌ Error updating employee:', employeeError);
        throw employeeError;
      }

      await refreshEmployees();
      
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });

    } catch (error: any) {
      console.error('💥 Error updating employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      console.log('🗑️ Deleting employee from Lovable Cloud:', employeeId);

      // Delete the employee (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (deleteError) {
        console.error('❌ Error deleting employee:', deleteError);
        throw deleteError;
      }

      await refreshEmployees();
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

    } catch (error: any) {
      console.error('💥 Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  return {
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
