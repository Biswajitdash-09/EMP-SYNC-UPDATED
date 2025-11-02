import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceReview {
  id: string;
  user_id: string;
  employee_id: string | null;
  reviewer_id: string | null;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  goals: string | null;
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Fetch all performance reviews (admin)
export const usePerformanceReviews = () => {
  return useQuery({
    queryKey: ['performance-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceReview[];
    },
  });
};

// Fetch user's own performance reviews
export const useMyPerformanceReviews = () => {
  return useQuery({
    queryKey: ['my-performance-reviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('performance_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceReview[];
    },
  });
};

// Create performance review
export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: Omit<PerformanceReview, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('performance_reviews')
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-reviews'] });
      toast({
        title: 'Success',
        description: 'Performance review created successfully',
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

// Update performance review
export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PerformanceReview> }) => {
      const { data, error } = await supabase
        .from('performance_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-reviews'] });
      toast({
        title: 'Success',
        description: 'Performance review updated successfully',
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

// Delete performance review
export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('performance_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-reviews'] });
      toast({
        title: 'Success',
        description: 'Performance review deleted successfully',
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
