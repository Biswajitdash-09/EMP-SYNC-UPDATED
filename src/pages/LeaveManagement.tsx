import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plane, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLeaveData } from '@/hooks/useLeaveData';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import NewLeaveRequestModal from '@/components/leave/NewLeaveRequestModal';
import LeaveApprovalModal from '@/components/leave/LeaveApprovalModal';
import HolidayModal from '@/components/leave/HolidayModal';
import LeaveTypeModal from '@/components/leave/LeaveTypeModal';
import LeaveStatsCards from '@/components/leave/LeaveStatsCards';
import LeaveRequestFilters from '@/components/leave/LeaveRequestFilters';
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable';
import LeaveBalancesTable from '@/components/leave/LeaveBalancesTable';
import LeaveTypesConfiguration from '@/components/leave/LeaveTypesConfiguration';
import HolidayCalendar from '@/components/leave/HolidayCalendar';
import LeaveReportsSection from '@/components/leave/LeaveReportsSection';
const LeaveManagement = () => {
  const navigate = useNavigate();
  const {
    leaveRequests,
    leaveBalances,
    leaveTypes,
    holidays,
    statusFilter,
    typeFilter,
    employeeFilter,
    setStatusFilter,
    setTypeFilter,
    setEmployeeFilter,
    addLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    deleteLeaveRequest,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    addHoliday,
    deleteHoliday,
    getAvailableBalance,
    pendingRequests,
    approvedThisMonth
  } = useLeaveData();
  const {
    allEmployees
  } = useEmployeeData();

  // Modal states
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const handleApprovalAction = (request: any) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };
  const handleEditLeaveType = (leaveType: any) => {
    setEditingLeaveType(leaveType);
    setShowLeaveTypeModal(true);
  };
  const employeeOptions = allEmployees.map(emp => ({
    id: emp.id,
    name: emp.name
  }));
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
                <Plane className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Leave Management</h1>
              </div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowNewRequestModal(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              New Leave Request
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <LeaveStatsCards pendingRequests={pendingRequests} approvedThisMonth={approvedThisMonth} totalHolidays={holidays.length} />

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="types">Leave Types</TabsTrigger>
            <TabsTrigger value="calendar">Holiday Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests & Approval System</CardTitle>
                <CardDescription>Manage and process employee leave requests</CardDescription>
                
                <LeaveRequestFilters statusFilter={statusFilter} typeFilter={typeFilter} employeeFilter={employeeFilter} setStatusFilter={setStatusFilter} setTypeFilter={setTypeFilter} setEmployeeFilter={setEmployeeFilter} leaveTypes={leaveTypes} employees={allEmployees} />
              </CardHeader>
              <CardContent>
                <LeaveRequestsTable leaveRequests={leaveRequests} onApprovalAction={handleApprovalAction} onDeleteRequest={deleteLeaveRequest} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Tracking</CardTitle>
                <CardDescription>Monitor employee leave balances across different leave types</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveBalancesTable leaveBalances={leaveBalances} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Leave Types Configuration</CardTitle>
                    <CardDescription>Configure different types of leave policies</CardDescription>
                  </div>
                  <Button onClick={() => {
                  setEditingLeaveType(null);
                  setShowLeaveTypeModal(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Leave Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <LeaveTypesConfiguration leaveTypes={leaveTypes} onEditLeaveType={handleEditLeaveType} onDeleteLeaveType={deleteLeaveType} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Holiday Calendar
                    </CardTitle>
                    <CardDescription>Company holidays and important dates</CardDescription>
                  </div>
                  <Button onClick={() => setShowHolidayModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <HolidayCalendar holidays={holidays} onDeleteHoliday={deleteHoliday} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Reports & Analytics</CardTitle>
                <CardDescription>Generate reports and track leave patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveReportsSection pendingRequests={pendingRequests} approvedThisMonth={approvedThisMonth} totalLeaveTypes={leaveTypes.length} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewLeaveRequestModal open={showNewRequestModal} onClose={() => setShowNewRequestModal(false)} onSubmit={addLeaveRequest} leaveTypes={leaveTypes} employees={employeeOptions} getAvailableBalance={getAvailableBalance} />

      <LeaveApprovalModal open={showApprovalModal} onClose={() => {
      setShowApprovalModal(false);
      setSelectedRequest(null);
    }} request={selectedRequest} onApprove={approveLeaveRequest} onReject={rejectLeaveRequest} />

      <HolidayModal open={showHolidayModal} onClose={() => setShowHolidayModal(false)} onSubmit={addHoliday} />

      <LeaveTypeModal open={showLeaveTypeModal} onClose={() => {
      setShowLeaveTypeModal(false);
      setEditingLeaveType(null);
    }} onSubmit={editingLeaveType ? data => updateLeaveType(editingLeaveType.id, data) : addLeaveType} leaveType={editingLeaveType} isEdit={!!editingLeaveType} />
    </div>;
};
export default LeaveManagement;