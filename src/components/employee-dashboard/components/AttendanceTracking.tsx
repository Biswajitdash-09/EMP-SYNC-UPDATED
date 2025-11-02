
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { employeeDashboardService } from '@/services/employeeDashboardService';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string;
  check_out?: string;
  status: string;
  notes?: string;
}

interface AttendanceTrackingProps {
  employeeId: string;
}

const AttendanceTracking = ({ employeeId }: AttendanceTrackingProps) => {
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState<AttendanceRecord | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get today's attendance
      const todayAttendance = await employeeDashboardService.getTodayAttendance();
      
      if (todayAttendance && !todayAttendance.check_out) {
        setIsCheckedIn(true);
        setCurrentSession(todayAttendance);
      }

      // Get recent attendance records
      const records = await employeeDashboardService.getAttendanceRecords(10);
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const record = await employeeDashboardService.checkIn(today);
      
      setIsCheckedIn(true);
      setCurrentSession(record);
      
      // Refresh records
      await loadAttendanceData();
      
      toast({
        title: "Checked In Successfully",
        description: `Check-in time: ${new Date(record.check_in).toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-in Failed",
        description: "Failed to record check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentSession) return;
    
    try {
      setLoading(true);
      
      await employeeDashboardService.checkOut(currentSession.id);
      
      setIsCheckedIn(false);
      setCurrentSession(null);
      
      // Refresh records
      await loadAttendanceData();
      
      toast({
        title: "Checked Out Successfully",
        description: `Check-out time: ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Check-out Failed",
        description: "Failed to record check-out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'early-logout': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const calculateTotalHours = (records: AttendanceRecord[]) => {
    return records.reduce((total, record) => {
      if (record.check_in && record.check_out) {
        const checkIn = new Date(record.check_in);
        const checkOut = new Date(record.check_out);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
  };

  const totalHours = calculateTotalHours(attendanceRecords);
  const lateEntries = attendanceRecords.filter(record => record.status === 'late').length;
  const earlyLogouts = attendanceRecords.filter(record => record.status === 'early-logout').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Attendance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              {!isCheckedIn ? (
                <Button 
                  onClick={handleCheckIn} 
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Check In
                </Button>
              ) : (
                <Button 
                  onClick={handleCheckOut} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4" />
                  Check Out
                </Button>
              )}
            </div>

            {currentSession && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Checked in at: <strong>{new Date(currentSession.check_in).toLocaleTimeString()}</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{lateEntries}</p>
                <p className="text-sm text-gray-600">Late Entries</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{earlyLogouts}</p>
                <p className="text-sm text-gray-600">Early Logouts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4">Loading attendance records...</p>
            ) : attendanceRecords.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No attendance records found</p>
            ) : (
              attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.check_in).toLocaleTimeString()} - {
                        record.check_out 
                          ? new Date(record.check_out).toLocaleTimeString()
                          : 'Not checked out'
                      }
                      {record.check_in && record.check_out && (
                        ` (${((new Date(record.check_out).getTime() - new Date(record.check_in).getTime()) / (1000 * 60 * 60)).toFixed(1)}h)`
                      )}
                    </p>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracking;
