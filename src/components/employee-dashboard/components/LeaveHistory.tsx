/**
 * Leave History Component
 * Displays employee's leave history with status indicators
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, XCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMyLeaveRequests } from '@/hooks/leave/useLeaveRequestsQuery';

const LeaveHistory = () => {
  const { toast } = useToast();
  const { myLeaveRequests, isLoading } = useMyLeaveRequests();
  const [attachments, setAttachments] = useState<Record<string, { name: string; url: string }[]>>({});

  const handleFileUpload = (leaveId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newAttachment = {
        name: file.name,
        url: URL.createObjectURL(file)
      };
      
      setAttachments(prev => ({
        ...prev,
        [leaveId]: [...(prev[leaveId] || []), newAttachment]
      }));
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been attached to your leave request.`,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave History & Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Leave History & Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myLeaveRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No leave requests found.</p>
        ) : (
          <div className="space-y-4">
            {myLeaveRequests.map((leave) => {
              const leaveAttachments = attachments[leave.id] || [];
              return (
                <div key={leave.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(leave.status)}
                      <h4 className="font-medium">{leave.leave_type}</h4>
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      Applied: {new Date(leave.applied_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Duration:</span> {leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}
                    </div>
                    <div>
                      <span className="font-medium">From:</span> {new Date(leave.start_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">To:</span> {new Date(leave.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {leave.reason && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </p>
                  )}

                  {leaveAttachments.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-sm">Attachments:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {leaveAttachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-xs">
                            <FileText className="w-3 h-3" />
                            {attachment.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {leave.status === 'pending' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Label htmlFor={`file-${leave.id}`} className="text-sm">Add supporting document:</Label>
                      <Input
                        id={`file-${leave.id}`}
                        type="file"
                        className="text-xs"
                        onChange={(e) => handleFileUpload(leave.id, e)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveHistory;
