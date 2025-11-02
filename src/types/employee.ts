
/**
 * Employee data type definitions
 * Defines the structure for employee records in the HR system
 * Includes personal info, employment details, document management, and login credentials
 */

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
