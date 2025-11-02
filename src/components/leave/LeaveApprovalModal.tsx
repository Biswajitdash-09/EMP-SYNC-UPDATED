
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Calendar, User, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
}

interface LeaveApprovalModalProps {
  open: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove: (id: string, approvedBy: string, comments?: string) => void;
  onReject: (id: string, approvedBy: string, comments: string) => void;
}

const LeaveApprovalModal = ({ 
  open, 
  onClose, 
  request, 
  onApprove, 
  onReject 
}: LeaveApprovalModalProps) => {
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  if (!request) return null;

  const handleApprove = () => {
    onApprove(request.id, 'HR Manager', comments || undefined);
    toast({
      title: "Leave Approved",
      description: `Leave request for ${request.employee} has been approved.`
    });
    handleClose();
  };

  const handleReject = () => {
    if (!comments.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }
    onReject(request.id, 'HR Manager', comments);
    toast({
      title: "Leave Rejected",
      description: `Leave request for ${request.employee} has been rejected.`
    });
    handleClose();
  };

  const handleClose = () => {
    setComments('');
    setActionType(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Request Approval
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject the leave request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Employee</p>
                  <p className="text-sm text-gray-600">{request.employee}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Leave Type</p>
                  <p className="text-sm text-gray-600">{request.type}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-gray-600">{request.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-gray-600">{request.endDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-gray-600">{request.days} days</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium">Applied Date</p>
                <p className="text-sm text-gray-600">{request.appliedDate}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Reason</p>
              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                {request.reason}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments {actionType === 'reject' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="comments"
              placeholder={
                actionType === 'approve' 
                  ? "Optional: Add any comments about the approval..." 
                  : actionType === 'reject'
                  ? "Required: Please provide a reason for rejection..."
                  : "Add your comments here..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setActionType('reject');
                handleReject();
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setActionType('approve');
                handleApprove();
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveApprovalModal;
