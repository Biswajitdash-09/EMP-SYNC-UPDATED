/**
 * React Query hooks for Leave Balances with Supabase integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaveBalance {
  id: string;
  user_id: string;
  employee_id: string | null;
  leave_type: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  created_at: string;
  updated_at: string;
}

const LEAVE_BALANCES_KEY = ['leave-balances'];

export const useLeaveBalances = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all leave balances
  const { data: leaveBalances = [], isLoading, error } = useQuery({
    queryKey: LEAVE_BALANCES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', new Date().getFullYear())
        .order('leave_type');

      if (error) throw error;
      return data as LeaveBalance[];
    },
  });

  // Update leave balance
  const updateLeaveBalance = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<LeaveBalance>;
    }) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEY });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    leaveBalances,
    isLoading,
    error,
    updateLeaveBalance: updateLeaveBalance.mutateAsync,
    isUpdating: updateLeaveBalance.isPending,
  };
};

// Hook for user's own leave balances
export const useMyLeaveBalances = () => {
  const { data: myLeaveBalances = [], isLoading, error } = useQuery({
    queryKey: ['my-leave-balances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', new Date().getFullYear())
        .order('leave_type');

      if (error) throw error;
      return data as LeaveBalance[];
    },
  });

  // Convert to balance object format for UI
  const balanceObject = myLeaveBalances.reduce((acc, balance) => {
    const key = balance.leave_type.toLowerCase().replace(/\s+/g, '_');
    acc[key] = {
      total: balance.total_days,
      used: balance.used_days,
      remaining: balance.remaining_days,
    };
    return acc;
  }, {} as Record<string, { total: number; used: number; remaining: number }>);

  return {
    myLeaveBalances,
    balanceObject,
    isLoading,
    error,
  };
};
