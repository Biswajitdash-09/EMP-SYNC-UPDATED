
/**
 * Employee Dashboard Container Component
 * Main container that handles authentication, state management, and tab rendering
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useEmployeeAuth } from '@/contexts/EmployeeAuthContext';
import { updateEmployeeProfile } from '@/services/employeeProfileService';
import EmployeeDashboardContent from './EmployeeDashboardContent';
import EmployeeDashboardLoading from './EmployeeDashboardLoading';

const EmployeeDashboardContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { employee, isAuthenticated, isLoading, logout, refreshEmployeeData } = useEmployeeAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Handle authentication check with proper delay to avoid race conditions
  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for authentication to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isLoading && !isAuthenticated && !redirectHandled) {
        console.log('⚠️ Access denied - not authenticated, redirecting to home');
        setRedirectHandled(true);
        toast({
          title: "Access Denied",
          description: "Please log in to access your dashboard.",
          variant: "destructive",
        });
        navigate('/', { replace: true });
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, navigate, toast, redirectHandled]);

  const handleLogout = async () => {
    try {
      console.log('🚪 User logging out');
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    if (!employee) return;
    
    try {
      await updateEmployeeProfile(employee.id, updates);
      await refreshEmployeeData();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast({
        title: "Update Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`📱 Tab changed to: ${value}`);
  };

  // Show loading state
  if (isLoading) {
    return <EmployeeDashboardLoading />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !employee) {
    return null;
  }

  console.log('✅ Rendering dashboard for authenticated user:', employee.name);

  return (
    <EmployeeDashboardContent
      employee={employee}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      onProfileUpdate={handleProfileUpdate}
    />
  );
};

export default EmployeeDashboardContainer;
