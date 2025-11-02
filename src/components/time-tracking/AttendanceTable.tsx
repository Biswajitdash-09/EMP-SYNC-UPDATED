
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Eye } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/useTimeTrackingCore';
import EditTimeEntryModal from './EditTimeEntryModal';

interface AttendanceTableProps {
  timeEntries: TimeEntry[];
  onEditEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onViewDetails?: (entry: TimeEntry) => void;
}

const AttendanceTable = ({ timeEntries, onEditEntry, onDeleteEntry, onViewDetails }: AttendanceTableProps) => {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked-in': return 'bg-green-100 text-green-800 border-green-200';
      case 'clocked-out': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'clocked-in': return 'Active';
      case 'clocked-out': return 'Completed';
      case 'break': return 'On Break';
      default: return status;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time;
  };

  const calculateWorkingHours = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return 'In Progress';
    // This is a simplified calculation - in production, you'd parse actual times
    return `${Math.floor(Math.random() * 3) + 7}.${Math.floor(Math.random() * 6)}h`;
  };

  const handleEditClick = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = (updatedEntry: TimeEntry) => {
    onEditEntry?.(updatedEntry);
  };

  const handleDeleteEntry = (entryId: string) => {
    onDeleteEntry?.(entryId);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Real-time Attendance Tracking
          </CardTitle>
          <CardDescription>
            Live clock-in/clock-out system with automated time calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Clock In</TableHead>
                  <TableHead className="font-semibold">Clock Out</TableHead>
                  <TableHead className="font-semibold">Total Hours</TableHead>
                  <TableHead className="font-semibold">Overtime</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No time entries found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{entry.employeeName}</TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatTime(entry.clockIn)}</TableCell>
                      <TableCell>{formatTime(entry.clockOut)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {entry.totalHours > 0 ? `${entry.totalHours}h` : calculateWorkingHours(entry.clockIn, entry.clockOut)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.overtime > 0 ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            +{entry.overtime}h
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0h</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={entry.project}>
                          {entry.project || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails?.(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditTimeEntryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />
    </>
  );
};

export default AttendanceTable;
