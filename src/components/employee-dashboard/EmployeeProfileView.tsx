
/**
 * Employee Profile View Component
 * Displays employee's personal and professional information
 */

import ProfileHeader from './components/ProfileHeader';
import ContactInformation from './components/ContactInformation';
import EmploymentDetails from './components/EmploymentDetails';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinDate: string;
  profilePicture?: string;
  manager: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  salary: {
    basic: number;
    allowances: number;
    deductions: number;
    netSalary: number;
  };
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
}

interface EmployeeProfileViewProps {
  employee: Employee;
}

const EmployeeProfileView = ({ employee }: EmployeeProfileViewProps) => {
  return (
    <div className="space-y-6">
      <ProfileHeader employee={employee} />
      <ContactInformation employee={employee} />
      <EmploymentDetails employee={employee} />
    </div>
  );
};

export default EmployeeProfileView;
