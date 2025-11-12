-- ============================================================
-- PHASE 1: CRITICAL SECURITY FIXES
-- ============================================================

-- 1.1: Strengthen RLS Policies for employees table
-- Add more granular access controls
DROP POLICY IF EXISTS "Employees can view their own data" ON public.employees;
CREATE POLICY "Employees can view their own data" 
ON public.employees 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND status = 'Active'
);

-- 1.2: Fix performance_reviews RLS - only show to subject, not reviewer
DROP POLICY IF EXISTS "Users can view their own performance reviews" ON public.performance_reviews;
CREATE POLICY "Users can view their own performance reviews" 
ON public.performance_reviews 
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR 
  (employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  ))
);

-- Reviewers should only be able to update, not view all
CREATE POLICY "Reviewers can update assigned reviews" 
ON public.performance_reviews 
FOR UPDATE 
USING (
  reviewer_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
  OR is_admin(auth.uid())
);

-- 1.3: Improve salary_components RLS - employees shouldn't see inactive or internal components
DROP POLICY IF EXISTS "Authenticated users can view active salary components" ON public.salary_components;
CREATE POLICY "Users can view relevant active salary components" 
ON public.salary_components 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) 
  AND (is_active = true)
  AND (
    is_admin(auth.uid())
    OR type IN ('earning', 'benefit') -- Only show earnings and benefits to regular users
  )
);

-- 1.4: Restrict feedback anonymous viewing to admins only
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (
  (auth.uid() = user_id AND NOT is_anonymous)
  OR is_admin(auth.uid())
);

-- ============================================================
-- PHASE 3: DATABASE OPTIMIZATIONS
-- ============================================================

-- 3.1: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_status ON public.leave_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status_date ON public.leave_requests(status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON public.payslips(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id, review_period_end DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status) WHERE status = 'Active';
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);

-- 3.2: Add composite indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON public.leave_balances(user_id, year, leave_type);
CREATE INDEX IF NOT EXISTS idx_performance_goals_user_status ON public.performance_goals(user_id, status);

-- 3.3: Add database functions for complex calculations

-- Function to calculate employee total compensation
CREATE OR REPLACE FUNCTION public.calculate_total_compensation(emp_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT base_salary FROM employees WHERE id = emp_id),
    0
  ) + COALESCE(
    (SELECT SUM(value) 
     FROM salary_components 
     WHERE type = 'earning' 
       AND is_active = true 
       AND calculation_type = 'fixed'),
    0
  );
$$;

-- Function to get employee leave balance
CREATE OR REPLACE FUNCTION public.get_leave_balance(emp_user_id uuid, leave_type_name text, year_val integer)
RETURNS TABLE(
  total_days integer,
  used_days integer,
  remaining_days integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(lb.total_days, 0) as total_days,
    COALESCE(lb.used_days, 0) as used_days,
    COALESCE(lb.remaining_days, 0) as remaining_days
  FROM leave_balances lb
  WHERE lb.user_id = emp_user_id
    AND lb.leave_type = leave_type_name
    AND lb.year = year_val
  LIMIT 1;
$$;

-- Function to calculate attendance stats for an employee
CREATE OR REPLACE FUNCTION public.calculate_attendance_stats(emp_user_id uuid, start_date date, end_date date)
RETURNS TABLE(
  total_days integer,
  present_days integer,
  total_hours numeric,
  average_hours numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::integer as total_days,
    COUNT(*) FILTER (WHERE status = 'present')::integer as present_days,
    COALESCE(SUM(
      EXTRACT(EPOCH FROM (check_out - check_in)) / 3600
    ), 0)::numeric as total_hours,
    COALESCE(AVG(
      EXTRACT(EPOCH FROM (check_out - check_in)) / 3600
    ), 0)::numeric as average_hours
  FROM attendance
  WHERE user_id = emp_user_id
    AND date BETWEEN start_date AND end_date
    AND check_in IS NOT NULL
    AND check_out IS NOT NULL;
$$;

-- 3.4: Add data integrity constraints

-- Ensure leave request dates are logical
ALTER TABLE public.leave_requests 
  DROP CONSTRAINT IF EXISTS leave_requests_dates_check;
ALTER TABLE public.leave_requests 
  ADD CONSTRAINT leave_requests_dates_check 
  CHECK (end_date >= start_date);

-- Ensure attendance check_out is after check_in
ALTER TABLE public.attendance 
  DROP CONSTRAINT IF EXISTS attendance_times_check;
ALTER TABLE public.attendance 
  ADD CONSTRAINT attendance_times_check 
  CHECK (check_out IS NULL OR check_out > check_in);

-- Ensure performance review ratings are valid
ALTER TABLE public.performance_reviews 
  DROP CONSTRAINT IF EXISTS performance_reviews_rating_check;
ALTER TABLE public.performance_reviews 
  ADD CONSTRAINT performance_reviews_rating_check 
  CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5));

-- Ensure feedback ratings are valid
ALTER TABLE public.feedback 
  DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE public.feedback 
  ADD CONSTRAINT feedback_rating_check 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- ============================================================
-- PHASE 4: ENHANCED FEATURES - Database Support
-- ============================================================

-- 4.1: Create table for saved search filters
CREATE TABLE IF NOT EXISTS public.saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_name text NOT NULL,
  module text NOT NULL, -- 'employees', 'leave_requests', etc.
  filter_config jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, module, filter_name)
);

ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved filters"
ON public.saved_filters
FOR ALL
USING (auth.uid() = user_id);

-- 4.2: Create table for notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT false,
  leave_requests boolean DEFAULT true,
  performance_reviews boolean DEFAULT true,
  payroll_updates boolean DEFAULT true,
  system_announcements boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4.3: Create table for report templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  report_type text NOT NULL,
  configuration jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own report templates"
ON public.report_templates
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public report templates"
ON public.report_templates
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4.4: Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  action_type text,
  entity_type_val text,
  entity_id_val text,
  changes_val jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes)
  VALUES (auth.uid(), action_type, entity_type_val, entity_id_val, changes_val);
END;
$$;