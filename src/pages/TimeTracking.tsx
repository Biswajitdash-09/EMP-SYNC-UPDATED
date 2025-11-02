import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Pause, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeTrackingCore } from '@/hooks/time-tracking/useTimeTrackingCore';
import { useMyAttendance, useAttendance, useAttendanceStats } from '@/hooks/time-tracking/useAttendanceQuery';
import AttendanceStats from '@/components/time-tracking/AttendanceStats';
import AttendanceTable from '@/components/time-tracking/AttendanceTable';
import TimesheetSection from '@/components/time-tracking/TimesheetSection';
import ShiftManagement from '@/components/time-tracking/ShiftManagement';
import OvertimeTracking from '@/components/time-tracking/OvertimeTracking';
import ReportsSection from '@/components/time-tracking/ReportsSection';
const TimeTracking = () => {
  const navigate = useNavigate();
  
  // Backend-integrated hooks
  const { 
    myAttendance, 
    todayAttendance, 
    todayHours, 
    weeklyHours, 
    isClockedIn,
    isLoading: attendanceLoading 
  } = useMyAttendance();
  
  const { clockIn, clockOut, isClockingin, isClockingOut, attendanceRecords } = useAttendance();
  const { stats: attendanceStats, isLoading: statsLoading } = useAttendanceStats();
  
  // Legacy mock data for features not yet migrated
  const {
    shifts,
    overtimeRequests,
    addTimesheetEntry,
    updateTimeEntry,
    deleteTimeEntry,
    addShift,
    updateShift,
    deleteShift,
    approveOvertime,
    rejectOvertime,
    addOvertimeRequest,
    deleteOvertimeRequest
  } = useTimeTrackingCore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimeString, setCurrentTimeString] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentTimeString(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockToggle = async () => {
    try {
      if (isClockedIn && todayAttendance) {
        await clockOut({ id: todayAttendance.id });
      } else {
        await clockIn(undefined);
      }
    } catch (error) {
      console.error('Clock toggle error:', error);
    }
  };

  // Convert attendance records to time entries format for display
  const timeEntries = attendanceRecords.map(record => ({
    id: record.id,
    employeeId: record.user_id,
    employeeName: 'Employee', // TODO: Join with profiles table
    date: record.date,
    clockIn: record.check_in ? new Date(record.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
    clockOut: record.check_out ? new Date(record.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
    totalHours: record.check_in && record.check_out 
      ? parseFloat(((new Date(record.check_out).getTime() - new Date(record.check_in).getTime()) / (1000 * 60 * 60)).toFixed(1))
      : 0,
    overtime: 0,
    status: !record.check_out ? 'clocked-in' as const : 'clocked-out' as const,
    project: undefined,
    description: record.notes || undefined,
  }));

  const todayEntries = timeEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="bg-orange-500 hover:bg-orange-400">
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">Time Tracking System</h1>
              </div>
            </div>
            
            {/* Real-time Clock and Status */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Clock className="w-4 h-4" />
                  {currentTimeString}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
                </p>
              </div>
              
              <div className="text-right border-l border-gray-200 pl-4">
                <p className="text-sm font-medium text-gray-900">Today: {todayHours} hours</p>
                <p className="text-xs text-gray-500">This week: {weeklyHours} hours</p>
              </div>
              
              <Button 
                onClick={handleClockToggle} 
                disabled={isClockingin || isClockingOut || attendanceLoading}
                className={`px-6 py-2 font-medium transition-all duration-200 ${isClockedIn ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"} shadow-lg`}
              >
                {isClockingin || isClockingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isClockedIn ? 'Clocking Out...' : 'Clocking In...'}
                  </>
                ) : isClockedIn ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Clock In
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border shadow-sm">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="timesheets" className="flex items-center gap-2">
              Timesheets
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              Overtime
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceStats stats={attendanceStats} />
            <AttendanceTable timeEntries={timeEntries} onEditEntry={updateTimeEntry} onDeleteEntry={deleteTimeEntry} onViewDetails={entry => console.log('View details:', entry)} />
          </TabsContent>

          <TabsContent value="timesheets" className="space-y-6">
            <TimesheetSection onAddEntry={addTimesheetEntry} todayEntries={todayEntries} />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <ShiftManagement shifts={shifts} onAddShift={addShift} onUpdateShift={updateShift} onDeleteShift={deleteShift} />
          </TabsContent>

          <TabsContent value="overtime" className="space-y-6">
            <OvertimeTracking overtimeRequests={overtimeRequests} onApproveOvertime={approveOvertime} onRejectOvertime={rejectOvertime} onAddOvertimeRequest={addOvertimeRequest} onDeleteOvertimeRequest={deleteOvertimeRequest} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              {/* Time Analytics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold mb-4">Weekly Productivity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monday</span>
                      <span className="font-medium">8.5h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tuesday</span>
                      <span className="font-medium">7.8h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Wednesday</span>
                      <span className="font-medium">8.2h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Thursday</span>
                      <span className="font-medium">9.1h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Friday</span>
                      <span className="font-medium">7.4h</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold mb-4">Time Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Development</span>
                        <span>65%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-full bg-blue-500 rounded" style={{
                        width: '65%'
                      }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Meetings</span>
                        <span>20%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-full bg-green-500 rounded" style={{
                        width: '20%'
                      }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Admin</span>
                        <span>15%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-full bg-yellow-500 rounded" style={{
                        width: '15%'
                      }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold mb-4">Efficiency Metrics</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <div className="text-sm text-gray-600">Attendance Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">8.2h</div>
                      <div className="text-sm text-gray-600">Avg Daily Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">12%</div>
                      <div className="text-sm text-gray-600">Overtime Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default TimeTracking;