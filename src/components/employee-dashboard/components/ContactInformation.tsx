
/**
 * Contact Information Component
 * Displays employee's contact details and emergency contact
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, User, UserCheck, AlertCircle } from 'lucide-react';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface Employee {
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
}

interface ContactInformationProps {
  employee: Employee;
}

const ContactInformation = ({ employee }: ContactInformationProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.emergencyContact.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.emergencyContact.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserCheck className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Relationship</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.emergencyContact.relationship}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformation;
