
/**
 * Employee data fetching hook
 * Handles retrieving employee data from Supabase with proper transformations
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/hooks/useEmployeeData';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeFetch = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      console.log('📊 Fetching employees from Lovable Cloud...');
      setLoading(true);
      
      // Get all employees with related data
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_emergency_contacts(*),
          employee_employment_history(*)
        `)
        .order('created_at', { ascending: false });

      if (employeesError) {
        console.error('❌ Error fetching employees:', employeesError);
        throw employeesError;
      }

      console.log('✅ Fetched employees:', employeesData?.length || 0);

      // Transform database data to Employee format
      const transformedEmployees: Employee[] = (employeesData || []).map(emp => {
        const emergencyContact = emp.employee_emergency_contacts?.[0] || {
          name: '',
          phone: '',
          relationship: ''
        };

        const allHistory = emp.employee_employment_history?.map(h => ({
          title: h.title,
          department: h.department,
          startDate: h.start_date,
          endDate: h.end_date || undefined,
          current: h.is_current
        })) || [];

        return {
          id: emp.id,
          name: emp.full_name,
          email: emp.email,
          phone: emp.phone || '',
          department: emp.department,
          role: emp.position,
          status: emp.status as 'Active' | 'Probation' | 'Terminated',
          joinDate: emp.join_date,
          address: emp.address || '',
          dateOfBirth: emp.date_of_birth || '',
          profilePicture: emp.profile_picture_url,
          emergencyContact,
          manager: emp.manager || '',
          baseSalary: Number(emp.base_salary) || 0,
          loginCredentials: {
            loginEmail: emp.email,
            password: '****', // Passwords managed via auth
            isActive: emp.user_id !== null
          },
          employmentHistory: allHistory,
          documents: []
        };
      });

      setEmployees(transformedEmployees);
      console.log('✅ Transformed employees:', transformedEmployees.length);
    } catch (error) {
      console.error('💥 Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees from database",
        variant: "destructive",
      });
      
      // Set empty array on error to prevent app crash
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    setEmployees
  };
};
