
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Policy } from '@/hooks/useHRData';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: Omit<Policy, 'id'> | { id: string; [key: string]: any }) => void;
  policy?: Policy | null;
}

const PolicyModal = ({ isOpen, onClose, onSave, policy }: PolicyModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    status: 'Draft' as 'Active' | 'Draft' | 'Archived'
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title,
        category: policy.category,
        content: policy.content,
        status: policy.status
      });
    } else {
      setFormData({
        title: '',
        category: '',
        content: '',
        status: 'Draft'
      });
    }
  }, [policy, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const policyData = {
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (policy) {
      onSave({ id: policy.id, ...policyData });
      toast({
        title: "Policy Updated",
        description: "The policy has been successfully updated.",
      });
    } else {
      onSave(policyData);
      toast({
        title: "Policy Created",
        description: "The new policy has been successfully created.",
      });
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
          <DialogDescription>
            {policy ? 'Update the policy information below.' : 'Create a new company policy.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Policy Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter policy title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Workplace Ethics">Workplace Ethics</SelectItem>
                <SelectItem value="Work Arrangement">Work Arrangement</SelectItem>
                <SelectItem value="Workplace Safety">Workplace Safety</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Benefits">Benefits</SelectItem>
                <SelectItem value="Code of Conduct">Code of Conduct</SelectItem>
                <SelectItem value="Legal Compliance">Legal Compliance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'Active' | 'Draft' | 'Archived') => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Policy Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter detailed policy content..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {policy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
