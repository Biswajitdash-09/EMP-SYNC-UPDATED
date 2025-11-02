/**
 * React Query hooks for Leave Requests with Supabase integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaveRequest {
  id: string;
  employee_id: string | null;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  status: string;
  applied_date: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

const LEAVE_REQUESTS_KEY = ['leave-requests'];

export const useLeaveRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all leave requests
  const { data: leaveRequests = [], isLoading, error } = useQuery({
    queryKey: LEAVE_REQUESTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('applied_date', { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
    },
  });

  // Create leave request mutation
  const createLeaveRequest = useMutation({
    mutationFn: async (request: {
      leave_type: string;
      start_date: string;
      end_date: string;
      days_requested: number;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          ...request,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUESTS_KEY });
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update leave request status (for admins)
  const updateLeaveRequestStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      comments,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      comments?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUESTS_KEY });
      toast({
        title: "Request Updated",
        description: "Leave request status has been updated.",
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

  // Delete leave request
  const deleteLeaveRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUESTS_KEY });
      toast({
        title: "Request Deleted",
        description: "Leave request has been deleted.",
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
    leaveRequests,
    isLoading,
    error,
    createLeaveRequest: createLeaveRequest.mutateAsync,
    isCreating: createLeaveRequest.isPending,
    updateLeaveRequestStatus: updateLeaveRequestStatus.mutateAsync,
    isUpdating: updateLeaveRequestStatus.isPending,
    deleteLeaveRequest: deleteLeaveRequest.mutateAsync,
    isDeleting: deleteLeaveRequest.isPending,
  };
};

// Hook for user's own leave requests
export const useMyLeaveRequests = () => {
  const { toast } = useToast();

  const { data: myLeaveRequests = [], isLoading, error } = useQuery({
    queryKey: ['my-leave-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
    },
  });

  return {
    myLeaveRequests,
    isLoading,
    error,
  };
};
