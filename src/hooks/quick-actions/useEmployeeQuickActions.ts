
/**
 * Employee Quick Actions Hook
 * Handles employee-related quick actions
 */

import { useToast } from "@/hooks/use-toast";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { 
  validateRequiredFields, 
  validateEmailFormat, 
  checkDuplicateEmail, 
  createEmployeeFromForm,
  EmployeeFormData 
} from "@/utils/employeeValidation";

export const useEmployeeQuickActions = () => {
  const { toast } = useToast();
  const { addEmployee, allEmployees } = useEmployeeData();

  const handleAddEmployee = (employeeForm: EmployeeFormData, resetForm: () => void) => {
    // Validate required fields
    if (!validateRequiredFields(employeeForm)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Email, Department).",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    if (!validateEmailFormat(employeeForm.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate email
    if (checkDuplicateEmail(employeeForm.email, allEmployees)) {
      toast({
        title: "Duplicate Email",
        description: "An employee with this email already exists.",
        variant: "destructive"
      });
      return;
    }

    // Create and add new employee
    const newEmployee = createEmployeeFromForm(employeeForm);
    addEmployee(newEmployee);
    
    const fullName = `${employeeForm.firstName.trim()} ${employeeForm.lastName.trim()}`;
    toast({
      title: "Employee Added Successfully",
      description: `${fullName} has been added to the employee records and is now available in the Employee Records page.`,
    });

    resetForm();
    console.log('Employee added via Quick Actions and synced to main records:', newEmployee);
  };

  return {
    handleAddEmployee
  };
};
