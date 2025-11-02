
/**
 * Payroll Summary Cards Component
 * Displays key payroll metrics in card format
 * Shows totals, employee counts, deductions, and payment dates
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, Calendar, Users } from 'lucide-react';

const PayrollSummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total payroll amount for current period */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$215,500</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      {/* Employee payment status tracking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">97/100</div>
          <p className="text-xs text-muted-foreground">3 pending</p>
        </CardContent>
      </Card>

      {/* Tax and deduction calculations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$35,240</div>
          <p className="text-xs text-muted-foreground">Federal & State</p>
        </CardContent>
      </Card>

      {/* Next payment schedule information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">July 1</div>
          <p className="text-xs text-muted-foreground">2024</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollSummaryCards;
