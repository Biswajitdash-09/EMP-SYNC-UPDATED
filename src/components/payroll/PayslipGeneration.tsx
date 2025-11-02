
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMyPayslips } from '@/hooks/payroll/usePayrollQuery';

const PayslipGeneration = () => {
  const { toast } = useToast();
  const { data: payslips, isLoading } = useMyPayslips();

  const generatePayslipContent = (payslip: any) => {
    const earnings = payslip.earnings || [];
    const deductions = payslip.deductions || [];
    
    const content = `
      PAYSLIP - ${payslip.employee_name}
      Employee Code: ${payslip.employee_code || 'N/A'}
      Generated on: ${new Date().toLocaleDateString()}
      
      EARNINGS:
      Base Salary: $${Number(payslip.base_salary).toLocaleString()}
      ${earnings.map((e: any) => `${e.name}: $${Number(e.amount).toLocaleString()}`).join('\n      ')}
      Total Gross Pay: $${Number(payslip.gross_pay).toLocaleString()}
      
      DEDUCTIONS:
      ${deductions.map((d: any) => `${d.name}: $${Number(d.amount).toLocaleString()}`).join('\n      ')}
      Total Deductions: $${Number(payslip.total_deductions).toLocaleString()}
      
      NET PAY: $${Number(payslip.net_pay).toLocaleString()}
      
      Payment Method: ${payslip.payment_method}
      Status: ${payslip.status}
      ${payslip.paid_date ? `Paid Date: ${new Date(payslip.paid_date).toLocaleDateString()}` : ''}
      
      This payslip is generated electronically and is valid without signature.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  };

  const handleDownloadPayslip = (payslip: any) => {
    try {
      const payslipUrl = generatePayslipContent(payslip);
      const link = document.createElement('a');
      link.href = payslipUrl;
      link.download = `payslip_${payslip.employee_code}_${payslip.employee_name.replace(' ', '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(payslipUrl);
      
      toast({
        title: "Payslip Downloaded",
        description: `Payslip for ${payslip.employee_name} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the payslip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAllPayslips = () => {
    if (!payslips || payslips.length === 0) {
      toast({
        title: "No Payslips",
        description: "There are no payslips to download.",
      });
      return;
    }
    
    try {
      payslips.forEach((payslip, index) => {
        setTimeout(() => {
          const payslipUrl = generatePayslipContent(payslip);
          const link = document.createElement('a');
          link.href = payslipUrl;
          link.download = `payslip_${payslip.employee_code}_${payslip.employee_name.replace(' ', '_')}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(payslipUrl);
        }, index * 100);
      });
      
      toast({
        title: "All Payslips Downloaded",
        description: "All payslips have been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download all payslips. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Payslip Generation
        </CardTitle>
        <CardDescription>Generate and manage employee payslips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Label htmlFor="payPeriod">Your Payslips</Label>
            <p className="text-sm text-muted-foreground">View and download your payslips</p>
          </div>
          <Button onClick={handleDownloadAllPayslips} disabled={!payslips || payslips.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading payslips...</p>
          </div>
        ) : !payslips || payslips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payslips available yet
          </div>
        ) : (
          <div className="grid gap-4">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{payslip.employee_name}</h4>
                  <p className="text-sm text-gray-600">Net Pay: ${Number(payslip.net_pay).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Status: {payslip.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadPayslip(payslip)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayslipGeneration;
