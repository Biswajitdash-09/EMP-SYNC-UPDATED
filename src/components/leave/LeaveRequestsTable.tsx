
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { LeaveRequest } from '@/hooks/useLeaveData';
import { useToast } from "@/hooks/use-toast";

interface LeaveRequestsTableProps {
  leaveRequests: LeaveRequest[];
  onApprovalAction: (request: LeaveRequest) => void;
  onDeleteRequest: (id: string) => void;
}

const LeaveRequestsTable = ({ 
  leaveRequests, 
  onApprovalAction,
  onDeleteRequest
}: LeaveRequestsTableProps) => {
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      onDeleteRequest(id);
      toast({
        title: "Request Deleted",
        description: "The leave request has been deleted."
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.id}</TableCell>
            <TableCell>{request.employee}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>{request.startDate}</TableCell>
            <TableCell>{request.endDate}</TableCell>
            <TableCell>{request.days}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {request.status === 'Pending' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onApprovalAction(request)}
                  >
                    Review
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => handleDeleteRequest(request.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaveRequestsTable;
