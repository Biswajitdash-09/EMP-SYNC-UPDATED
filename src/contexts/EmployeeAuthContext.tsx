
/**
 * Employee Authentication Context
 * Provides employee authentication state throughout the app
 * Enhanced with Supabase auth integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { validateEmployeeSession, EmployeeAuthData, clearEmployeeAuth } from '@/services/employeeAuthService';
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

interface EmployeeAuthContextType {
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshEmployeeData: () => Promise<void>;
  error: string | null;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | undefined>(undefined);

interface EmployeeAuthProviderProps {
  children: ReactNode;
}

export const EmployeeAuthProvider = ({ children }: EmployeeAuthProviderProps) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEmployeeData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const authData = await validateEmployeeSession();
      
      if (authData) {
        // Validate employee data integrity
        if (!authData.employee || !authData.employee.id || !authData.employee.name) {
          throw new Error('Invalid employee data structure');
        }
        
        console.log('✅ Employee data refreshed successfully:', authData.employee.name);
        setEmployee(authData.employee);
      } else {
        console.log('❌ No valid session found, clearing employee data');
        setEmployee(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing employee data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh employee data');
      setEmployee(null);
      // Clear potentially corrupted session
      await clearEmployeeAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing employee authentication...');
      await refreshEmployeeData();
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setEmployee(null);
      } else if (event === 'SIGNED_IN' && session) {
        await refreshEmployeeData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshEmployeeData]);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out employee...');
      await clearEmployeeAuth();
      setEmployee(null);
      setError(null);
    } catch (error) {
      console.error('❌ Error during logout:', error);
      setError('Failed to logout properly. Please clear your browser cache.');
    }
  }, []);

  const value = {
    employee,
    isAuthenticated: !!employee,
    isLoading,
    logout,
    refreshEmployeeData,
    error
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};
