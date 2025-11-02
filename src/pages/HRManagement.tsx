import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, Users, Shield, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHRData } from '@/hooks/useHRData';
import { useToast } from "@/hooks/use-toast";
import PolicyModal from '@/components/hr/PolicyModal';
import AnnouncementModal from '@/components/hr/AnnouncementModal';
import OrganizationModal from '@/components/hr/OrganizationModal';
import OnboardingModal from '@/components/hr/OnboardingModal';
import AccessControlModal from '@/components/hr/AccessControlModal';
const HRManagement = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    policies,
    announcements,
    addPolicy,
    updatePolicy,
    deletePolicy,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  } = useHRData();

  // Modal states
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [accessControlModalOpen, setAccessControlModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const handleEditPolicy = policy => {
    setEditingPolicy(policy);
    setPolicyModalOpen(true);
  };
  const handleEditAnnouncement = announcement => {
    setEditingAnnouncement(announcement);
    setAnnouncementModalOpen(true);
  };
  const handleDeletePolicy = policyId => {
    deletePolicy(policyId);
    toast({
      title: "Policy Deleted",
      description: "The policy has been successfully deleted."
    });
  };
  const handleDeleteAnnouncement = announcementId => {
    deleteAnnouncement(announcementId);
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been successfully deleted."
    });
  };
  const closeModals = () => {
    setPolicyModalOpen(false);
    setAnnouncementModalOpen(false);
    setOrganizationModalOpen(false);
    setOnboardingModalOpen(false);
    setAccessControlModalOpen(false);
    setEditingPolicy(null);
    setEditingAnnouncement(null);
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="bg-orange-400 hover:bg-orange-300 text-slate-50">
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">HR Management</h1>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setPolicyModalOpen(true)}>
              <FileText className="w-4 h-4 mr-2" />
              New Policy
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="structure">Organization</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Company Policies & Handbook
                </CardTitle>
                <CardDescription>Manage company policies and employee handbook ({policies.length} policies)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {policies.map(policy => <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{policy.title}</h4>
                        <p className="text-sm text-gray-600">Category: {policy.category}</p>
                        <p className="text-xs text-gray-500">Last updated: {policy.lastUpdated}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${policy.status === 'Active' ? 'bg-green-100 text-green-800' : policy.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {policy.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePolicy(policy.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Organizational Structure
                </CardTitle>
                <CardDescription>Define company hierarchy and reporting structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Executive</h4>
                    <p className="text-sm text-gray-600">3 positions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Management</h4>
                    <p className="text-sm text-gray-600">12 positions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium">Staff</h4>
                    <p className="text-sm text-gray-600">89 positions</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setOrganizationModalOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Update Organization Chart
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding & Offboarding Workflows</CardTitle>
                <CardDescription>Manage employee onboarding and offboarding processes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Onboarding Checklist</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Welcome email sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">IT equipment assigned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Office tour completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">HR documentation signed</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Offboarding Checklist</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Exit interview scheduled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">IT equipment returned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Access revoked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Final payroll processed</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setOnboardingModalOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Workflows
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  HR Announcements
                </CardTitle>
                <CardDescription>Company-wide announcements and updates ({announcements.length} announcements)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.map(announcement => <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          By {announcement.author} • {announcement.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${announcement.priority === 'High' ? 'bg-red-100 text-red-800' : announcement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {announcement.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${announcement.status === 'Published' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {announcement.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>)}
                <Button className="w-full" variant="outline" onClick={() => setAnnouncementModalOpen(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Create New Announcement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role-Based Access Management
                </CardTitle>
                <CardDescription>Configure user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Admin</h4>
                      <p className="text-sm text-gray-600">Full system access</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAccessControlModalOpen(true)}>
                        Edit
                      </Button>
                      <span className="text-sm text-gray-500">3 users</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">HR Manager</h4>
                      <p className="text-sm text-gray-600">HR and employee management</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAccessControlModalOpen(true)}>
                        Edit
                      </Button>
                      <span className="text-sm text-gray-500">5 users</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Employee</h4>
                      <p className="text-sm text-gray-600">Basic access to personal data</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAccessControlModalOpen(true)}>
                        Edit
                      </Button>
                      <span className="text-sm text-gray-500">89 users</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PolicyModal isOpen={policyModalOpen} onClose={closeModals} onSave={editingPolicy ? updatePolicy : addPolicy} policy={editingPolicy} />

      <AnnouncementModal isOpen={announcementModalOpen} onClose={closeModals} onSave={editingAnnouncement ? updateAnnouncement : addAnnouncement} announcement={editingAnnouncement} />

      <OrganizationModal isOpen={organizationModalOpen} onClose={closeModals} />

      <OnboardingModal isOpen={onboardingModalOpen} onClose={closeModals} />

      <AccessControlModal isOpen={accessControlModalOpen} onClose={closeModals} />
    </div>;
};
export default HRManagement;