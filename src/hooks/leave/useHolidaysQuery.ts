/**
 * React Query hooks for Holidays with Supabase integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string | null;
  created_at: string;
}

const HOLIDAYS_KEY = ['holidays'];

export const useHolidays = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all holidays
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: HOLIDAYS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date');

      if (error) throw error;
      return data as Holiday[];
    },
  });

  // Create holiday (admin only)
  const createHoliday = useMutation({
    mutationFn: async (holiday: {
      name: string;
      date: string;
      type?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('holidays')
        .insert(holiday)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_KEY });
      toast({
        title: "Holiday Created",
        description: "New holiday has been added.",
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

  // Update holiday (admin only)
  const updateHoliday = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Holiday>;
    }) => {
      const { data, error } = await supabase
        .from('holidays')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_KEY });
      toast({
        title: "Holiday Updated",
        description: "Holiday has been updated.",
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

  // Delete holiday (admin only)
  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_KEY });
      toast({
        title: "Holiday Deleted",
        description: "Holiday has been deleted.",
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
    holidays,
    isLoading,
    error,
    createHoliday: createHoliday.mutateAsync,
    isCreating: createHoliday.isPending,
    updateHoliday: updateHoliday.mutateAsync,
    isUpdating: updateHoliday.isPending,
    deleteHoliday: deleteHoliday.mutateAsync,
    isDeleting: deleteHoliday.isPending,
  };
};
