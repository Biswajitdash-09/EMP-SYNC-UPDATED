/**
 * React Query hooks for Leave Types with Supabase integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  days_allowed: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const LEAVE_TYPES_KEY = ['leave-types'];

export const useLeaveTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active leave types
  const { data: leaveTypes = [], isLoading, error } = useQuery({
    queryKey: LEAVE_TYPES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as LeaveType[];
    },
  });

  // Create leave type (admin only)
  const createLeaveType = useMutation({
    mutationFn: async (leaveType: {
      name: string;
      description?: string;
      days_allowed: number;
      color?: string;
    }) => {
      const { data, error } = await supabase
        .from('leave_types')
        .insert(leaveType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_KEY });
      toast({
        title: "Leave Type Created",
        description: "New leave type has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update leave type (admin only)
  const updateLeaveType = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<LeaveType>;
    }) => {
      const { data, error } = await supabase
        .from('leave_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_KEY });
      toast({
        title: "Leave Type Updated",
        description: "Leave type has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete/deactivate leave type (admin only)
  const deleteLeaveType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_KEY });
      toast({
        title: "Leave Type Deactivated",
        description: "Leave type has been deactivated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    leaveTypes,
    isLoading,
    error,
    createLeaveType: createLeaveType.mutateAsync,
    isCreating: createLeaveType.isPending,
    updateLeaveType: updateLeaveType.mutateAsync,
    isUpdating: updateLeaveType.isPending,
    deleteLeaveType: deleteLeaveType.mutateAsync,
    isDeleting: deleteLeaveType.isPending,
  };
};
