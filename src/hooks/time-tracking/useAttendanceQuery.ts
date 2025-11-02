/**
 * React Query hooks for Attendance with Supabase integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Attendance {
  id: string;
  user_id: string;
  employee_id: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const ATTENDANCE_KEY = ['attendance'];

export const useAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all attendance records
  const { data: attendanceRecords = [], isLoading, error } = useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
        .order('check_in', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Attendance[];
    },
  });

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async (notes?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Check if already clocked in today
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .is('check_out', null)
        .maybeSingle();

      if (existing) {
        throw new Error('Already clocked in for today');
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: user.id,
          date: today,
          check_in: now.toISOString(),
          status: 'present',
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      toast({
        title: "Clocked In",
        description: `Successfully clocked in at ${new Date(data.check_in!).toLocaleTimeString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Clock In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const now = new Date();

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      
      // Calculate hours worked
      const checkIn = new Date(data.check_in!);
      const checkOut = new Date(data.check_out!);
      const hoursWorked = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1);
      
      toast({
        title: "Clocked Out",
        description: `Successfully clocked out. Total hours: ${hoursWorked}h`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Clock Out Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update attendance record
  const updateAttendance = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Attendance>;
    }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
      toast({
        title: "Attendance Updated",
        description: "Attendance record has been updated.",
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

  // Delete attendance record
  const deleteAttendance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
      toast({
        title: "Attendance Deleted",
        description: "Attendance record has been deleted.",
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
    attendanceRecords,
    isLoading,
    error,
    clockIn: clockIn.mutateAsync,
    isClockingin: clockIn.isPending,
    clockOut: clockOut.mutateAsync,
    isClockingOut: clockOut.isPending,
    updateAttendance: updateAttendance.mutateAsync,
    isUpdating: updateAttendance.isPending,
    deleteAttendance: deleteAttendance.mutateAsync,
    isDeleting: deleteAttendance.isPending,
  };
};

// Hook for user's own attendance
export const useMyAttendance = () => {
  const { toast } = useToast();

  const { data: myAttendance = [], isLoading, error } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      return data as Attendance[];
    },
  });

  // Get today's attendance
  const todayAttendance = myAttendance.find(
    (record) => record.date === new Date().toISOString().split('T')[0] && !record.check_out
  );

  // Calculate stats
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const weekStartStr = thisWeekStart.toISOString().split('T')[0];

    let todayHours = 0;
    let weeklyHours = 0;

    myAttendance.forEach((record) => {
      if (record.check_in && record.check_out) {
        const checkIn = new Date(record.check_in);
        const checkOut = new Date(record.check_out);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        if (record.date === today) {
          todayHours = hours;
        }

        if (record.date >= weekStartStr) {
          weeklyHours += hours;
        }
      }
    });

    return {
      todayHours: todayHours.toFixed(1),
      weeklyHours: weeklyHours.toFixed(1),
      isClockedIn: !!todayAttendance,
    };
  };

  const stats = calculateStats();

  return {
    myAttendance,
    todayAttendance,
    isLoading,
    error,
    ...stats,
  };
};

// Hook for attendance statistics (admin)
export const useAttendanceStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data: todayAttendance, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (error) throw error;

      const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
      const lateArrivals = todayAttendance.filter((a) => {
        if (!a.check_in) return false;
        const checkInTime = new Date(a.check_in);
        const nineAM = new Date(checkInTime);
        nineAM.setHours(9, 0, 0, 0);
        return checkInTime > nineAM;
      }).length;

      // Calculate average work hours
      let totalHours = 0;
      let completedRecords = 0;
      todayAttendance.forEach((record) => {
        if (record.check_in && record.check_out) {
          const checkIn = new Date(record.check_in);
          const checkOut = new Date(record.check_out);
          totalHours += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          completedRecords++;
        }
      });

      const avgWorkHours = completedRecords > 0 ? (totalHours / completedRecords).toFixed(1) : '0';

      return {
        presentToday,
        totalEmployees: 100, // This should come from employees table
        lateArrivals,
        absences: 100 - presentToday,
        avgWorkHours: parseFloat(avgWorkHours),
        weeklyHours: 37.5, // TODO: Calculate from actual data
        monthlyHours: 168, // TODO: Calculate from actual data
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    stats: stats || {
      presentToday: 0,
      totalEmployees: 0,
      lateArrivals: 0,
      absences: 0,
      avgWorkHours: 0,
      weeklyHours: 0,
      monthlyHours: 0,
    },
    isLoading,
  };
};
