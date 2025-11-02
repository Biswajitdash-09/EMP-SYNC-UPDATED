
/**
 * Payroll Table Component
 * Displays detailed payroll information for employees
 * Includes view functionality for individual employee payroll details
 */

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, DollarSign } from 'lucide-react';
import { Payslip } from '@/hooks/payroll/usePayrollQuery';

interface PayrollTableProps {
  payslips: Payslip[];
}

const PayrollTable = ({ payslips }: PayrollTableProps) => {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsViewOpen(true);
  };

  /**
   * Formats currency values for consistent display
   * @param amount - The monetary amount to format
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
      case 'paid':
      case 'Processed': 
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Gross Pay</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((payslip) => (
              <TableRow key={payslip.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{payslip.employee_code || 'N/A'}</TableCell>
                <TableCell>{payslip.employee_name}</TableCell>
                <TableCell>{formatCurrency(Number(payslip.base_salary))}</TableCell>
                <TableCell>{formatCurrency(Number(payslip.gross_pay))}</TableCell>
                <TableCell>{formatCurrency(Number(payslip.total_deductions))}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(Number(payslip.net_pay))}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payslip.status)}>
                    {payslip.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewPayslip(payslip)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {payslips.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payroll data available for this period.
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payslip Details - {selectedPayslip?.employee_name}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of payroll components for {selectedPayslip?.employee_code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayslip && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Code</label>
                  <p className="text-lg font-semibold">{selectedPayslip.employee_code || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-lg font-semibold">{selectedPayslip.employee_name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Payroll Breakdown</h4>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Earnings</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Salary</span>
                      <span className="font-medium">{formatCurrency(Number(selectedPayslip.base_salary))}</span>
                    </div>
                    {selectedPayslip.earnings.map((earning: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{earning.name}</span>
                        <span className="font-medium">{formatCurrency(Number(earning.amount))}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Gross Pay</span>
                        <span>{formatCurrency(Number(selectedPayslip.gross_pay))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">Deductions</h5>
                  <div className="space-y-2">
                    {selectedPayslip.deductions.map((deduction: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{deduction.name}</span>
                        <span className="font-medium">{formatCurrency(Number(deduction.amount))}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(Number(selectedPayslip.total_deductions))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Pay</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(Number(selectedPayslip.net_pay))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Processing Status:</span>
                  <Badge className={getStatusColor(selectedPayslip.status)}>
                    {selectedPayslip.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayrollTable;
