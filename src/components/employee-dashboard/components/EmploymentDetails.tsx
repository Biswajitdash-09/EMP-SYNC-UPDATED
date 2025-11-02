
/**
 * Employment Details Component
 * Displays employee's employment information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from 'lucide-react';

interface Employee {
  department: string;
  role: string;
  manager: string;
}

interface EmploymentDetailsProps {
  employee: Employee;
}

const EmploymentDetails = ({ employee }: EmploymentDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Employment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium mb-1">Department</p>
            <Badge variant="outline">{employee.department}</Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Position</p>
            <Badge variant="outline">{employee.role}</Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Manager</p>
            <Badge variant="outline">{employee.manager}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmploymentDetails;
