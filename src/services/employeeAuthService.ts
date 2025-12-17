
/**
 * Employee Authentication Service
 * Handles employee login validation using Supabase Auth
 * Syncs with the main employee records from admin portal
 */

import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'Probation' | 'Terminated';
  phone: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  manager: string;
  baseSalary: number;
  profilePicture?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EmployeeAuthData {
  employee: Employee;
  loginTime: string;
  role: 'employee';
  userId: string;
}

/**
 * Fetch emergency contact for an employee
 */
const fetchEmergencyContact = async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('employee_emergency_contacts')
      .select('*')
      .eq('employee_id', employeeId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { name: '', phone: '', relationship: '' };
    }

    return {
      name: data.name,
      phone: data.phone,
      relationship: data.relationship
    };
  } catch {
    return { name: '', phone: '', relationship: '' };
  }
};

/**
 * Transform database employee to app employee format
 */
const transformEmployee = async (dbEmployee: any): Promise<Employee> => {
  const emergencyContact = await fetchEmergencyContact(dbEmployee.id);
  
  return {
    id: dbEmployee.id,
    name: dbEmployee.full_name,
    email: dbEmployee.email,
    department: dbEmployee.department,
    role: dbEmployee.position,
    status: dbEmployee.status,
    phone: dbEmployee.phone || '',
    address: dbEmployee.address || '',
    dateOfBirth: dbEmployee.date_of_birth || '',
    joinDate: dbEmployee.join_date,
    manager: dbEmployee.manager || '',
    baseSalary: dbEmployee.base_salary || 0,
    profilePicture: dbEmployee.profile_picture_url || undefined,
    emergencyContact
  };
};

/**
 * Authenticate employee using Supabase Auth
 * Returns employee data if credentials are valid
 */
export const authenticateEmployee = async (email: string, password: string): Promise<EmployeeAuthData | null> => {
  console.log('🔐 Starting Supabase authentication for:', email);
  
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (authError) {
      console.log('❌ Supabase auth failed:', authError.message);
      return null;
    }

    if (!authData.user) {
      console.log('❌ No user returned from auth');
      return null;
    }

    console.log('✅ Supabase auth successful, checking role...');

    // Check if user has employee role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .single();

    if (roleError || !roleData) {
      console.log('❌ Could not fetch user role:', roleError?.message);
      // Sign out the user since they don't have proper role
      await supabase.auth.signOut();
      return null;
    }

    // Allow both 'employee' and 'admin' roles to access employee dashboard
    if (roleData.role !== 'employee' && roleData.role !== 'admin') {
      console.log('❌ User does not have employee or admin role:', roleData.role);
      await supabase.auth.signOut();
      return null;
    }

    console.log('✅ User has valid role:', roleData.role);

    // Fetch employee data linked to this auth user
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (employeeError || !employeeData) {
      console.log('❌ Could not fetch employee data:', employeeError?.message);
      // Try to find employee by email as fallback
      const { data: employeeByEmail, error: emailError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (emailError || !employeeByEmail) {
        console.log('❌ No employee record found for this user');
        await supabase.auth.signOut();
        return null;
      }

      // Update employee record with user_id
      await supabase
        .from('employees')
        .update({ user_id: authData.user.id })
        .eq('id', employeeByEmail.id);

      console.log('✅ Employee found and linked by email:', employeeByEmail.full_name);
      
      const employee = await transformEmployee(employeeByEmail);
      
      return {
        employee,
        loginTime: new Date().toISOString(),
        role: 'employee',
        userId: authData.user.id
      };
    }

    console.log('✅ Authentication successful for:', employeeData.full_name);
    
    const employee = await transformEmployee(employeeData);
    
    return {
      employee,
      loginTime: new Date().toISOString(),
      role: 'employee',
      userId: authData.user.id
    };

  } catch (error) {
    console.error('💥 Authentication error:', error);
    return null;
  }
};

/**
 * Get employee data by user ID (for refreshing data)
 */
export const getEmployeeByUserId = async (userId: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return await transformEmployee(data);
  } catch (error) {
    console.error('Error fetching employee by user ID:', error);
    return null;
  }
};

/**
 * Check if employee session is valid using Supabase session
 */
export const validateEmployeeSession = async (): Promise<EmployeeAuthData | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Check role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!roleData || (roleData.role !== 'employee' && roleData.role !== 'admin')) {
      return null;
    }

    // Fetch employee data
    const employee = await getEmployeeByUserId(session.user.id);
    
    if (!employee) {
      return null;
    }

    return {
      employee,
      loginTime: new Date().toISOString(),
      role: 'employee',
      userId: session.user.id
    };
  } catch (error) {
    console.error('Error validating employee session:', error);
    return null;
  }
};

/**
 * Store employee authentication data (legacy support)
 */
export const storeEmployeeAuth = (authData: EmployeeAuthData): void => {
  localStorage.setItem('employee-auth', JSON.stringify(authData));
};

/**
 * Clear employee authentication data
 */
export const clearEmployeeAuth = async (): Promise<void> => {
  localStorage.removeItem('employee-auth');
  await supabase.auth.signOut();
};
