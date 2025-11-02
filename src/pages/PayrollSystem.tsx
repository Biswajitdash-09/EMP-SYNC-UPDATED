import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Calculator, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import PayrollOverview from '@/components/payroll/PayrollOverview';
import SalaryComponents from '@/components/payroll/SalaryComponents';
import PayslipGeneration from '@/components/payroll/PayslipGeneration';
import TaxReports from '@/components/payroll/TaxReports';
import PayrollHistory from '@/components/payroll/PayrollHistory';
import { usePayslips, useProcessPayroll } from '@/hooks/payroll/usePayrollQuery';
interface PayrollEmployee {
  id: string;
  name: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: 'Processed' | 'Pending';
}
interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction' | 'benefit';
  value: string;
  editable: boolean;
}
const PayrollSystem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: payslips, isLoading: payslipsLoading } = usePayslips();
  const processPayroll = useProcessPayroll();
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([
  // Earnings
  {
    id: 'earn1',
    name: 'Base Salary',
    type: 'earning',
    value: '100%',
    editable: false
  }, {
    id: 'earn2',
    name: 'Performance Bonus',
    type: 'earning',
    value: 'Variable',
    editable: true
  }, {
    id: 'earn3',
    name: 'Overtime',
    type: 'earning',
    value: '1.5x rate',
    editable: true
  },
  // Deductions
  {
    id: 'ded1',
    name: 'Federal Tax',
    type: 'deduction',
    value: '22%',
    editable: true
  }, {
    id: 'ded2',
    name: 'State Tax',
    type: 'deduction',
    value: '5%',
    editable: true
  }, {
    id: 'ded3',
    name: 'Health Insurance',
    type: 'deduction',
    value: '$250',
    editable: true
  },
  // Benefits
  {
    id: 'ben1',
    name: '401(k) Match',
    type: 'benefit',
    value: '4%',
    editable: true
  }, {
    id: 'ben2',
    name: 'Dental Insurance',
    type: 'benefit',
    value: '$45',
    editable: true
  }, {
    id: 'ben3',
    name: 'Life Insurance',
    type: 'benefit',
    value: '$25',
    editable: true
  }]);
  const [processPayrollOpen, setProcessPayrollOpen] = useState(false);
  
  const handleProcessPayroll = () => {
    // Process all pending payslips
    const pendingPayslips = payslips?.filter(p => p.status === 'pending') || [];
    
    if (pendingPayslips.length > 0) {
      Promise.all(
        pendingPayslips.map(payslip => 
          processPayroll.mutateAsync(payslip.payroll_run_id || '')
        )
      ).then(() => {
        setProcessPayrollOpen(false);
      });
    } else {
      toast({
        title: "No Pending Payroll",
        description: "There are no pending payroll entries to process.",
      });
      setProcessPayrollOpen(false);
    }
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="bg-amber-500 hover:bg-amber-400">
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Payroll System</h1>
              </div>
            </div>
            <Dialog open={processPayrollOpen} onOpenChange={setProcessPayrollOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Process Payroll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process Payroll</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to process the payroll for all pending employees? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setProcessPayrollOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProcessPayroll} 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={processPayroll.isPending}
                  >
                    {processPayroll.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Process Payroll
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Salary Components</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
            <TabsTrigger value="taxes">Tax Reports</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {payslipsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading payroll data...</p>
              </div>
            ) : (
              <PayrollOverview />
            )}
          </TabsContent>

          <TabsContent value="components">
            <SalaryComponents />
          </TabsContent>

          <TabsContent value="payslips">
            <PayslipGeneration />
          </TabsContent>

          <TabsContent value="taxes">
            <TaxReports />
          </TabsContent>

          <TabsContent value="history">
            <PayrollHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default PayrollSystem;