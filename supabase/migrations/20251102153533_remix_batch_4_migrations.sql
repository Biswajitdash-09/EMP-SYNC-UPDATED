
-- Migration: 20251030142730

-- Migration: 20251030141805
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  employee_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (CRITICAL: roles stored separately for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Probation', 'Terminated')),
  join_date DATE NOT NULL,
  manager TEXT,
  base_salary DECIMAL(10, 2),
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create employee_emergency_contacts table
CREATE TABLE public.employee_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create employee_employment_history table
CREATE TABLE public.employee_employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create company_settings table
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_employment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checks (prevents privilege escalation)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for employees
CREATE POLICY "Employees can view their own data"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all employees"
  ON public.employees FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update employees"
  ON public.employees FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete employees"
  ON public.employees FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for employee_emergency_contacts
CREATE POLICY "Employees can view their own emergency contacts"
  ON public.employee_emergency_contacts FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all emergency contacts"
  ON public.employee_emergency_contacts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage emergency contacts"
  ON public.employee_emergency_contacts FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for employee_employment_history
CREATE POLICY "Employees can view their own employment history"
  ON public.employee_employment_history FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all employment history"
  ON public.employee_employment_history FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage employment history"
  ON public.employee_employment_history FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for company_settings
CREATE POLICY "Admins can manage company settings"
  ON public.company_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_emergency_contacts_updated_at
  BEFORE UPDATE ON public.employee_emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251030142057
-- Phase 2-4 Tables: Leave Management, Time Tracking, Documents, Notifications

-- Leave Types table
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  days_allowed INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leave Requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_date TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leave Balances table
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  remaining_days INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, leave_type, year)
);

-- Holidays table
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'public',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half-day')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support Tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feedback_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Reviews table
CREATE TABLE public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Leave Types (Everyone can view, admins can manage)
CREATE POLICY "Everyone can view leave types"
  ON public.leave_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage leave types"
  ON public.leave_types FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Leave Requests
CREATE POLICY "Users can view their own leave requests"
  ON public.leave_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all leave requests"
  ON public.leave_requests FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all leave requests"
  ON public.leave_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Leave Balances
CREATE POLICY "Users can view their own leave balances"
  ON public.leave_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all leave balances"
  ON public.leave_balances FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage leave balances"
  ON public.leave_balances FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Holidays (Everyone can view, admins can manage)
CREATE POLICY "Everyone can view holidays"
  ON public.holidays FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage holidays"
  ON public.holidays FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Attendance
CREATE POLICY "Users can view their own attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attendance"
  ON public.attendance FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage their own attendance"
  ON public.attendance FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Documents
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can upload their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all documents"
  ON public.documents FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Support Tickets
CREATE POLICY "Users can view their own support tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support tickets"
  ON public.support_tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all support tickets"
  ON public.support_tickets FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Performance Reviews
CREATE POLICY "Users can view their own performance reviews"
  ON public.performance_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all performance reviews"
  ON public.performance_reviews FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage performance reviews"
  ON public.performance_reviews FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_leave_types_updated_at
  BEFORE UPDATE ON public.leave_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Migration: 20251030143344
-- Fix security warnings: Restrict holidays and leave_types to authenticated users only

-- Drop existing public policies
DROP POLICY IF EXISTS "Everyone can view holidays" ON holidays;
DROP POLICY IF EXISTS "Everyone can view leave types" ON leave_types;

-- Create new authenticated-only policies
CREATE POLICY "Authenticated users can view holidays" 
ON holidays 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view leave types" 
ON leave_types 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Migration: 20251031173207
-- Create performance_goals table for tracking employee goals
CREATE TABLE IF NOT EXISTS public.performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  deadline DATE NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create performance_feedback table for peer/manager feedback
CREATE TABLE IF NOT EXISTS public.performance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  to_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  from_employee TEXT NOT NULL,
  to_employee TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Positive', 'Constructive', 'Recognition')),
  comments TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for performance_goals
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for performance_goals
CREATE POLICY "Users can view their own goals"
ON public.performance_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals"
ON public.performance_goals FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can create their own goals"
ON public.performance_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.performance_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all goals"
ON public.performance_goals FOR ALL
USING (is_admin(auth.uid()));

-- Enable RLS for performance_feedback
ALTER TABLE public.performance_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for performance_feedback
CREATE POLICY "Users can view feedback about themselves"
ON public.performance_feedback FOR SELECT
USING (
  auth.uid() = user_id OR 
  to_employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all feedback"
ON public.performance_feedback FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can submit feedback"
ON public.performance_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedback"
ON public.performance_feedback FOR ALL
USING (is_admin(auth.uid()));

-- Add trigger for performance_goals updated_at
CREATE TRIGGER update_performance_goals_updated_at
BEFORE UPDATE ON public.performance_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_performance_goals_user_id ON public.performance_goals(user_id);
CREATE INDEX idx_performance_goals_employee_id ON public.performance_goals(employee_id);
CREATE INDEX idx_performance_goals_status ON public.performance_goals(status);
CREATE INDEX idx_performance_feedback_to_employee ON public.performance_feedback(to_employee_id);
CREATE INDEX idx_performance_feedback_from_employee ON public.performance_feedback(from_employee_id);

-- Migration: 20251031173559
-- Create payroll_runs table for tracking payroll cycles
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'cancelled')),
  total_gross DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_net DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create salary_components table for defining earning/deduction types
CREATE TABLE IF NOT EXISTS public.salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'deduction', 'benefit')),
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('fixed', 'percentage', 'variable')),
  value DECIMAL(12,2),
  percentage DECIMAL(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payslips table for individual employee payslips
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  base_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  earnings JSONB DEFAULT '[]'::jsonb,
  deductions JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_account TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tax_calculations table for tracking tax withholdings
CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payslip_id UUID REFERENCES public.payslips(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  tax_period TEXT NOT NULL,
  federal_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  state_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  social_security DECIMAL(12,2) NOT NULL DEFAULT 0,
  medicare DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_taxes JSONB DEFAULT '[]'::jsonb,
  total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

-- RLS policies for payroll_runs
CREATE POLICY "Admins can manage payroll runs"
ON public.payroll_runs FOR ALL
USING (is_admin(auth.uid()));

-- RLS policies for salary_components
CREATE POLICY "Admins can manage salary components"
ON public.salary_components FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view active salary components"
ON public.salary_components FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS policies for payslips
CREATE POLICY "Users can view their own payslips"
ON public.payslips FOR SELECT
USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all payslips"
ON public.payslips FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage payslips"
ON public.payslips FOR ALL
USING (is_admin(auth.uid()));

-- RLS policies for tax_calculations
CREATE POLICY "Users can view their own tax calculations"
ON public.tax_calculations FOR SELECT
USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all tax calculations"
ON public.tax_calculations FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage tax calculations"
ON public.tax_calculations FOR ALL
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_payroll_runs_updated_at
BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_components_updated_at
BEFORE UPDATE ON public.salary_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at
BEFORE UPDATE ON public.payslips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_payroll_runs_user_id ON public.payroll_runs(user_id);
CREATE INDEX idx_payroll_runs_status ON public.payroll_runs(status);
CREATE INDEX idx_payroll_runs_period ON public.payroll_runs(period_start, period_end);
CREATE INDEX idx_salary_components_user_id ON public.salary_components(user_id);
CREATE INDEX idx_salary_components_type ON public.salary_components(type);
CREATE INDEX idx_payslips_user_id ON public.payslips(user_id);
CREATE INDEX idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX idx_payslips_payroll_run_id ON public.payslips(payroll_run_id);
CREATE INDEX idx_payslips_status ON public.payslips(status);
CREATE INDEX idx_tax_calculations_employee_id ON public.tax_calculations(employee_id);
CREATE INDEX idx_tax_calculations_tax_year ON public.tax_calculations(tax_year);
