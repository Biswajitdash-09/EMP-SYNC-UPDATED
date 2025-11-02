
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const leaveRequestSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  type: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters")
});

type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;

interface NewLeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leaveTypes: Array<{ id: string; name: string; maxDays: number }>;
  employees: Array<{ id: string; name: string }>;
  getAvailableBalance: (employeeId: string, leaveTypeId: string) => number;
}

const NewLeaveRequestModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  leaveTypes, 
  employees,
  getAvailableBalance 
}: NewLeaveRequestModalProps) => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  const form = useForm<LeaveRequestForm>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employee: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    }
  });

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const watchedStartDate = form.watch('startDate');
  const watchedEndDate = form.watch('endDate');
  const calculatedDays = calculateDays(watchedStartDate, watchedEndDate);

  const availableBalance = selectedEmployee && selectedLeaveType 
    ? getAvailableBalance(selectedEmployee, selectedLeaveType)
    : 0;

  const handleSubmit = (data: LeaveRequestForm) => {
    const selectedEmp = employees.find(emp => emp.id === data.employee);
    
    if (calculatedDays > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${availableBalance} days available for this leave type.`,
        variant: "destructive"
      });
      return;
    }

    const requestData = {
      employeeId: data.employee,
      employee: selectedEmp?.name || '',
      type: leaveTypes.find(type => type.id === data.type)?.name || '',
      startDate: data.startDate,
      endDate: data.endDate,
      days: calculatedDays,
      reason: data.reason,
      status: 'Pending' as const
    };

    onSubmit(requestData);
    form.reset();
    setSelectedEmployee('');
    setSelectedLeaveType('');
    toast({
      title: "Leave Request Submitted",
      description: "Your leave request has been submitted for approval."
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            New Leave Request
          </DialogTitle>
          <DialogDescription>
            Submit a new leave request for approval
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedEmployee(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedLeaveType(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} (Max: {type.maxDays} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedEmployee && selectedLeaveType && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>Available Balance: {availableBalance} days</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculatedDays > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">
                  Total days: {calculatedDays}
                  {calculatedDays > availableBalance && (
                    <span className="text-red-600 ml-2">
                      (Exceeds available balance)
                    </span>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide a detailed reason for your leave request..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLeaveRequestModal;
