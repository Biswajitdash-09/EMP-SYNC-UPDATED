
/**
 * Employee Data Management Hook with Supabase Integration
 * Handles all employee CRUD operations with real-time updates and filtering
 */

import { useEmployeeCore } from './employee/useEmployeeCore';
import { useEmployeeFilters } from './employee/useEmployeeFilters';

export interface Employee {
  // Basic identification
  id: string;
  name: string;
  email: string;
  phone: string;
  
  // Employment information
  department: string;
  role: string;
  status: 'Active' | 'Probation' | 'Terminated';
  joinDate: string;
  
  // Personal details
  address: string;
  dateOfBirth: string;
  profilePicture?: string;
  
  // Emergency contact information
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Management and compensation
  manager: string;
  baseSalary: number;
  
  // Login credentials (set by admin)
  loginCredentials: {
    loginEmail: string;
    password: string;
    isActive: boolean;
  };
  
  // Employment history tracking
  employmentHistory: Array<{
    title: string;
    department: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
  
  // Document management
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
  }>;
}

export const useEmployeeData = () => {
  // Core employee operations with Supabase
  const {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees
  } = useEmployeeCore();

  // Filtering and search functionality
  const {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    filteredEmployees,
    departments,
    statuses
  } = useEmployeeFilters(employees);

  return {
    employees: filteredEmployees,
    allEmployees: employees, // Provide allEmployees for backward compatibility
    loading,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    departments,
    statuses,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees
  };
};
