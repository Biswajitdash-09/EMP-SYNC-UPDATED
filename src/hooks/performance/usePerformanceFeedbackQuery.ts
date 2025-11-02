import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceFeedback {
  id: string;
  user_id: string;
  from_employee_id: string | null;
  to_employee_id: string | null;
  from_employee: string;
  to_employee: string;
  type: 'Positive' | 'Constructive' | 'Recognition';
  comments: string;
  is_anonymous: boolean;
  created_at: string;
}

// Fetch all feedback (admin)
export const usePerformanceFeedback = () => {
  return useQuery({
    queryKey: ['performance-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceFeedback[];
    },
  });
};

// Fetch feedback for current user
export const useMyPerformanceFeedback = () => {
  return useQuery({
    queryKey: ['my-performance-feedback'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get employee record for current user
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('performance_feedback')
        .select('*')
        .eq('to_employee_id', employee?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceFeedback[];
    },
  });
};

// Create feedback
export const useCreatePerformanceFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: Omit<PerformanceFeedback, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('performance_feedback')
        .insert({
          ...feedback,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-feedback'] });
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
