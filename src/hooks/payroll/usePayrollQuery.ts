import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayrollRun {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  payment_date: string;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  total_gross: number;
  total_deductions: number;
  total_net: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  user_id: string;
  employee_id: string | null;
  payroll_run_id: string | null;
  employee_name: string;
  employee_code: string | null;
  base_salary: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  earnings: any[];
  deductions: any[];
  benefits: any[];
  payment_method: string;
  bank_account: string | null;
  status: 'pending' | 'processed' | 'paid' | 'cancelled';
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryComponent {
  id: string;
  user_id: string;
  name: string;
  type: 'earning' | 'deduction' | 'benefit';
  calculation_type: 'fixed' | 'percentage' | 'variable';
  value: number | null;
  percentage: number | null;
  is_active: boolean;
  is_taxable: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all payroll runs
export const usePayrollRuns = () => {
  return useQuery({
    queryKey: ['payroll-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*')
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data as PayrollRun[];
    },
  });
};

// Fetch all payslips
export const usePayslips = () => {
  return useQuery({
    queryKey: ['payslips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payslip[];
    },
  });
};

// Fetch user's own payslips
export const useMyPayslips = () => {
  return useQuery({
    queryKey: ['my-payslips'],
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
        .from('payslips')
        .select('*')
        .eq('employee_id', employee?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payslip[];
    },
  });
};

// Fetch salary components
export const useSalaryComponents = () => {
  return useQuery({
    queryKey: ['salary-components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_components')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;
      return data as SalaryComponent[];
    },
  });
};

// Create payroll run
export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (run: Omit<PayrollRun, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payroll_runs')
        .insert({
          ...run,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast({
        title: 'Success',
        description: 'Payroll run created successfully',
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

// Create payslip
export const useCreatePayslip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payslip: Omit<Payslip, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payslips')
        .insert({
          ...payslip,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['my-payslips'] });
      toast({
        title: 'Success',
        description: 'Payslip created successfully',
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

// Update payslip status
export const useUpdatePayslipStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Payslip['status'] }) => {
      const { data, error } = await supabase
        .from('payslips')
        .update({ status, paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['my-payslips'] });
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

// Create/Update salary component
export const useManageSalaryComponent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (component: Omit<SalaryComponent, 'created_at' | 'updated_at' | 'user_id'> & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (component.id) {
        // Update
        const { data, error } = await supabase
          .from('salary_components')
          .update(component)
          .eq('id', component.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from('salary_components')
          .insert({
            ...component,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-components'] });
      toast({
        title: 'Success',
        description: 'Salary component saved successfully',
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

// Process payroll (update all pending payslips to processed)
export const useProcessPayroll = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payrollRunId: string) => {
      const { data, error } = await supabase
        .from('payslips')
        .update({ status: 'processed' })
        .eq('payroll_run_id', payrollRunId)
        .eq('status', 'pending')
        .select();

      if (error) throw error;

      // Update payroll run status
      await supabase
        .from('payroll_runs')
        .update({ status: 'completed' })
        .eq('id', payrollRunId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast({
        title: 'Payroll Processed',
        description: 'All pending payroll entries have been processed successfully.',
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
