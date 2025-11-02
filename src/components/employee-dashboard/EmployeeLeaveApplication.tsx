
/**
 * Employee Leave Application Component
 * Allows employees to apply for leave and view their leave history
 */

import LeaveBalanceOverview from './components/LeaveBalanceOverview';
import LeaveApplicationForm from './components/LeaveApplicationForm';
import LeaveHistory from './components/LeaveHistory';

interface Employee {
  id: string;
  name: string;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
}

interface EmployeeLeaveApplicationProps {
  employee: Employee;
}

const EmployeeLeaveApplication = ({ employee }: EmployeeLeaveApplicationProps) => {
  return (
    <div className="space-y-6">
      <LeaveBalanceOverview leaveBalance={employee.leaveBalance} />
      <LeaveApplicationForm employee={employee} />
      <LeaveHistory />
    </div>
  );
};

export default EmployeeLeaveApplication;
