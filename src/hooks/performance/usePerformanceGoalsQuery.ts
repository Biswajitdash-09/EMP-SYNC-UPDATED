import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceGoal {
  id: string;
  user_id: string;
  employee_id: string | null;
  title: string;
  description: string | null;
  progress: number;
  deadline: string;
  category: string;
  status: 'Active' | 'Completed' | 'Overdue';
  created_at: string;
  updated_at: string;
}

// Fetch all goals (admin)
export const usePerformanceGoals = () => {
  return useQuery({
    queryKey: ['performance-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceGoal[];
    },
  });
};

// Fetch user's own goals
export const useMyPerformanceGoals = () => {
  return useQuery({
    queryKey: ['my-performance-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('performance_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceGoal[];
    },
  });
};

// Create goal
export const useCreatePerformanceGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goal: Omit<PerformanceGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('performance_goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-goals'] });
      toast({
        title: 'Success',
        description: 'Goal created successfully',
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

// Update goal progress
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      // Determine status based on progress and deadline
      const { data: goal } = await supabase
        .from('performance_goals')
        .select('deadline')
        .eq('id', id)
        .single();

      let status: 'Active' | 'Completed' | 'Overdue' = 'Active';
      if (progress >= 100) {
        status = 'Completed';
      } else if (goal && new Date(goal.deadline) < new Date()) {
        status = 'Overdue';
      }

      const { data, error } = await supabase
        .from('performance_goals')
        .update({ progress, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-goals'] });
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

// Delete goal
export const useDeletePerformanceGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('performance_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-goals'] });
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
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
