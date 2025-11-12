import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Download, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface BulkOperationsProps {
  selectedItems: any[];
  onClearSelection: () => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkUpdate?: (ids: string[], updates: any) => Promise<void>;
  onBulkExport?: (ids: string[]) => void;
  entityName: string;
}

export const BulkOperations = ({
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkUpdate,
  onBulkExport,
  entityName,
}: BulkOperationsProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateData, setUpdateData] = useState('');

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    setIsProcessing(true);
    try {
      const ids = selectedItems.map(item => item.id);
      await onBulkDelete(ids);
      toast({
        title: "Success",
        description: `${selectedItems.length} ${entityName}(s) deleted successfully`,
      });
      setShowDeleteDialog(false);
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${entityName}s`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!onBulkUpdate) return;
    
    try {
      const updates = JSON.parse(updateData);
      setIsProcessing(true);
      
      const ids = selectedItems.map(item => item.id);
      await onBulkUpdate(ids, updates);
      
      toast({
        title: "Success",
        description: `${selectedItems.length} ${entityName}(s) updated successfully`,
      });
      setShowUpdateDialog(false);
      setUpdateData('');
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = () => {
    if (!onBulkExport) return;
    const ids = selectedItems.map(item => item.id);
    onBulkExport(ids);
    toast({
      title: "Exporting...",
      description: `Exporting ${selectedItems.length} ${entityName}(s)`,
    });
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 min-w-[400px]">
          <div className="flex items-center gap-2 flex-1">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {selectedItems.length} {entityName}(s) selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {onBulkExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            
            {onBulkUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUpdateDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Update
              </Button>
            )}
            
            {onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} {entityName}(s)? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedItems.length} ${entityName}(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update</DialogTitle>
            <DialogDescription>
              Enter JSON data to update {selectedItems.length} {entityName}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Update Data (JSON)</Label>
              <Textarea
                value={updateData}
                onChange={(e) => setUpdateData(e.target.value)}
                placeholder='{"status": "Active", "department": "IT"}'
                className="font-mono text-sm"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateDialog(false);
                setUpdateData('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={isProcessing || !updateData.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedItems.length} ${entityName}(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
