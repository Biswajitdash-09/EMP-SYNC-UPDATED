
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaveBalance } from '@/hooks/useLeaveData';

interface LeaveBalancesTableProps {
  leaveBalances: LeaveBalance[];
}

const LeaveBalancesTable = ({ leaveBalances }: LeaveBalancesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Vacation Days</TableHead>
          <TableHead>Sick Leave</TableHead>
          <TableHead>Personal Days</TableHead>
          <TableHead>Total Available</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveBalances.map((balance, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{balance.employee}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{balance.vacation - balance.usedVacation}/{balance.vacation} days</span>
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-blue-500 rounded" 
                    style={{ width: `${((balance.vacation - balance.usedVacation) / balance.vacation) * 100}%` }}
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{balance.sick - balance.usedSick}/{balance.sick} days</span>
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-green-500 rounded" 
                    style={{ width: `${((balance.sick - balance.usedSick) / balance.sick) * 100}%` }}
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{balance.personal - balance.usedPersonal}/{balance.personal} days</span>
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-purple-500 rounded" 
                    style={{ width: `${((balance.personal - balance.usedPersonal) / balance.personal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {(balance.vacation - balance.usedVacation) + 
               (balance.sick - balance.usedSick) + 
               (balance.personal - balance.usedPersonal)} days
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaveBalancesTable;
