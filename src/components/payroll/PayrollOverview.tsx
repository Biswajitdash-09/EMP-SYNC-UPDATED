
/**
 * Payroll Overview Component
 * Displays payroll summary and employee payment status
 * Main interface for payroll management and monitoring
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PayrollSummaryCards from './PayrollSummaryCards';
import PayrollTable from './PayrollTable';
import { usePayslips } from '@/hooks/payroll/usePayrollQuery';
import { Loader2 } from 'lucide-react';

const PayrollOverview = () => {
  const { data: payslips, isLoading } = usePayslips();
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading payroll data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* High-level payroll statistics */}
      <PayrollSummaryCards />

      {/* Detailed payroll data table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Payroll Period</CardTitle>
          <CardDescription>Latest payroll processing status</CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollTable payslips={payslips || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollOverview;
