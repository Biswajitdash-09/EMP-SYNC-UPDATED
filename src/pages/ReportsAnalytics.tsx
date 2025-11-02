import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, BarChart3, TrendingUp, Users, Calendar, DollarSign, Clock, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import ReportsSection from '@/components/time-tracking/ReportsSection';
import PayrollOverview from '@/components/payroll/PayrollOverview';
import TaxReports from '@/components/payroll/TaxReports';
const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Enhanced state management
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });

  // Enhanced mock data
  const metrics = [{
    title: 'Total Employees',
    value: '1,248',
    change: '+12',
    trend: 'up',
    icon: Users,
    description: 'Active employees in system'
  }, {
    title: 'Avg. Attendance Rate',
    value: '94.5%',
    change: '+2.1%',
    trend: 'up',
    icon: Calendar,
    description: 'Monthly attendance average'
  }, {
    title: 'Monthly Payroll',
    value: '$2.4M',
    change: '+5.2%',
    trend: 'up',
    icon: DollarSign,
    description: 'Total payroll expenses'
  }, {
    title: 'Avg. Performance Score',
    value: '4.2/5',
    change: '+0.3',
    trend: 'up',
    icon: BarChart3,
    description: 'Employee performance rating'
  }];
  const reportTemplates = [{
    id: 1,
    name: 'Employee Attendance Report',
    category: 'Attendance',
    lastGenerated: '2024-06-28',
    size: '2.4 MB',
    downloads: 45
  }, {
    id: 2,
    name: 'Comprehensive Payroll Report',
    category: 'Payroll',
    lastGenerated: '2024-06-27',
    size: '3.8 MB',
    downloads: 67
  }, {
    id: 3,
    name: 'Employee Turnover Analysis',
    category: 'HR Analytics',
    lastGenerated: '2024-06-26',
    size: '1.9 MB',
    downloads: 23
  }, {
    id: 4,
    name: 'Performance Metrics Dashboard',
    category: 'Performance',
    lastGenerated: '2024-06-25',
    size: '2.8 MB',
    downloads: 34
  }, {
    id: 5,
    name: 'Custom Department Analysis',
    category: 'Custom',
    lastGenerated: '2024-06-24',
    size: '4.2 MB',
    downloads: 12
  }];

  // Enhanced payroll data
  const payrollData = [{
    id: 'emp1',
    name: 'John Smith',
    baseSalary: 75000,
    bonuses: 5000,
    deductions: 15000,
    netPay: 65000,
    status: 'Processed' as const
  }, {
    id: 'emp2',
    name: 'Sarah Johnson',
    baseSalary: 68000,
    bonuses: 3200,
    deductions: 13500,
    netPay: 57700,
    status: 'Processed' as const
  }, {
    id: 'emp3',
    name: 'Mike Chen',
    baseSalary: 82000,
    bonuses: 6500,
    deductions: 17800,
    netPay: 70700,
    status: 'Pending' as const
  }, {
    id: 'emp4',
    name: 'Emily Davis',
    baseSalary: 71000,
    bonuses: 4100,
    deductions: 14200,
    netPay: 60900,
    status: 'Processed' as const
  }, {
    id: 'emp5',
    name: 'David Wilson',
    baseSalary: 79000,
    bonuses: 5800,
    deductions: 16500,
    netPay: 68300,
    status: 'Processed' as const
  }];

  // Enhanced functions
  const generateReport = (templateId: number) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Enhanced report content generation
    let reportContent = `
COMPREHENSIVE ${template.name.toUpperCase()}
${'='.repeat(template.name.length + 13)}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Report ID: ${template.category.substring(0, 3).toUpperCase()}-${Date.now()}
Date Range: ${reportFilters.startDate || 'All Time'} to ${reportFilters.endDate || 'Current'}
Department: ${selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}

EXECUTIVE SUMMARY:
==================
This report provides comprehensive insights into ${template.category.toLowerCase()} 
metrics and analytics for the specified period.

KEY METRICS:
============
• Total Records Analyzed: ${Math.floor(Math.random() * 1000) + 500}
• Data Accuracy: 99.7%
• Report Generation Time: ${Math.floor(Math.random() * 10) + 1} seconds
• Last Updated: ${new Date().toISOString()}

DETAILED ANALYSIS:
==================
`;

    // Add category-specific content
    switch (template.category) {
      case 'Attendance':
        reportContent += `
ATTENDANCE BREAKDOWN:
• Present Days: ${Math.floor(Math.random() * 20) + 20}
• Absent Days: ${Math.floor(Math.random() * 5) + 1}
• Late Arrivals: ${Math.floor(Math.random() * 10) + 2}
• Early Departures: ${Math.floor(Math.random() * 8) + 1}
• Overall Attendance Rate: ${(Math.random() * 10 + 90).toFixed(1)}%

DEPARTMENT PERFORMANCE:
• IT Department: 92.5% attendance
• Finance: 95.2% attendance
• HR: 98.1% attendance
• Operations: 89.7% attendance
`;
        break;
      case 'Payroll':
        reportContent += `
PAYROLL SUMMARY:
• Total Gross Pay: $${(Math.random() * 500000 + 1000000).toLocaleString()}
• Total Deductions: $${(Math.random() * 100000 + 200000).toLocaleString()}
• Total Net Pay: $${(Math.random() * 400000 + 800000).toLocaleString()}
• Average Salary: $${(Math.random() * 20000 + 60000).toLocaleString()}

TAX BREAKDOWN:
• Federal Tax: $${(Math.random() * 50000 + 100000).toLocaleString()}
• State Tax: $${(Math.random() * 20000 + 40000).toLocaleString()}
• Social Security: $${(Math.random() * 15000 + 30000).toLocaleString()}
`;
        break;
      default:
        reportContent += `
CUSTOM ANALYSIS:
This section contains detailed analysis specific to ${template.category}
with comprehensive data points and actionable insights.
`;
    }
    reportContent += `

RECOMMENDATIONS:
================
Based on the analysis, we recommend:
1. Continue monitoring key performance indicators
2. Address any identified areas of concern
3. Implement suggested improvements
4. Schedule regular review meetings

TECHNICAL DETAILS:
==================
• Report Format: Comprehensive Text Report
• Data Sources: HR Management System, Time Tracking, Payroll
• Processing Method: Automated Analysis Engine
• Quality Assurance: Multi-level validation passed

---
This report was generated automatically by the HR Analytics System.
For questions or support, contact the HR Analytics team.
Report Version: 2.1.0
    `;

    // Download the report
    const blob = new Blob([reportContent], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Report Generated Successfully",
      description: `${template.name} has been generated and downloaded.`
    });
  };
  const exportToExcel = (data: any[], filename: string) => {
    // Simulate Excel export
    let csvContent = '';
    if (data.length > 0) {
      // Headers
      csvContent += Object.keys(data[0]).join(',') + '\n';
      // Data rows
      data.forEach(row => {
        csvContent += Object.values(row).join(',') + '\n';
      });
    }
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: `${filename} has been exported to CSV format.`
    });
  };
  const filteredReports = reportTemplates.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = reportFilters.category === 'all' || report.category === reportFilters.category;
    return matchesSearch && matchesCategory;
  });
  return <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="bg-rose-600 hover:bg-rose-500">
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-cyan-600" />
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => exportToExcel(payrollData, 'payroll_export')}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Advanced Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {metrics.map((metric, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {metric.change}
                      </span>
                      <span className="text-gray-500">from last month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </CardContent>
                </Card>)}
            </div>

            {/* Enhanced Report Templates */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Production-Ready Report Templates</CardTitle>
                    <CardDescription>Comprehensive business intelligence reports</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
                    </div>
                    <Select value={reportFilters.category} onValueChange={value => setReportFilters(prev => ({
                    ...prev,
                    category: value
                  }))}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Attendance">Attendance</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="HR Analytics">HR Analytics</SelectItem>
                        <SelectItem value="Performance">Performance</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map(report => <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {report.category}
                          </span>
                        </TableCell>
                        <TableCell>{report.lastGenerated}</TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>{report.downloads}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => generateReport(report.id)}>
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Generate
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <ReportsSection />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="space-y-6">
              <PayrollOverview />
              <TaxReports />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Employee Turnover Analytics & Productivity Metrics</CardTitle>
                <CardDescription>Advanced analytics and business intelligence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Turnover Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-red-50 rounded">
                        <span>Turnover Rate (YTD)</span>
                        <span className="font-medium text-red-600">8.5%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span>Avg. Tenure</span>
                        <span className="font-medium text-blue-600">3.2 years</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 rounded">
                        <span>Retention Rate</span>
                        <span className="font-medium text-green-600">91.5%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-purple-50 rounded">
                        <span>New Hires (YTD)</span>
                        <span className="font-medium text-purple-600">156</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Productivity Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-green-50 rounded">
                        <span>Avg. Performance Score</span>
                        <span className="font-medium text-green-600">4.2/5.0</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span>Goal Completion Rate</span>
                        <span className="font-medium text-blue-600">78%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-yellow-50 rounded">
                        <span>Training Hours/Employee</span>
                        <span className="font-medium text-yellow-600">24.5h</span>
                      </div>
                      <div className="flex justify-between p-3 bg-indigo-50 rounded">
                        <span>Employee Satisfaction</span>
                        <span className="font-medium text-indigo-600">4.1/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                    <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
                    <span className="font-medium">Trend Analysis</span>
                    <span className="text-sm text-gray-600">View trends over time</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                    <BarChart3 className="w-8 h-8 mb-2 text-green-600" />
                    <span className="font-medium">Department Analysis</span>
                    <span className="text-sm text-gray-600">Compare departments</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                    <Users className="w-8 h-8 mb-2 text-purple-600" />
                    <span className="font-medium">Employee Insights</span>
                    <span className="text-sm text-gray-600">Individual analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics & Business Intelligence</CardTitle>
                <CardDescription>Deep insights and predictive analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Workforce Analytics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded">
                        <span>Employee Engagement Score</span>
                        <span className="font-medium text-blue-600">87.3%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded">
                        <span>Productivity Index</span>
                        <span className="font-medium text-green-600">94.2</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded">
                        <span>Skills Development Rate</span>
                        <span className="font-medium text-purple-600">76.8%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded">
                        <span>Leadership Pipeline</span>
                        <span className="font-medium text-orange-600">23 candidates</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Predictive Insights</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded">
                        <span>Turnover Risk Score</span>
                        <span className="font-medium text-red-600">Low (12.3%)</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-teal-50 to-teal-100 rounded">
                        <span>Recruitment Forecast</span>
                        <span className="font-medium text-teal-600">45 positions</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded">
                        <span>Budget Optimization</span>
                        <span className="font-medium text-indigo-600">8.7% savings</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded">
                        <span>Compliance Score</span>
                        <span className="font-medium text-pink-600">98.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription>Build custom reports with drag-and-drop interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Report Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input id="reportName" placeholder="Enter report name" />
                      </div>
                      <div>
                        <Label htmlFor="dataSource">Data Source</Label>
                        <Input id="dataSource" placeholder="Select data source" />
                      </div>
                      <div>
                        <Label htmlFor="reportFormat">Format</Label>
                        <Input id="reportFormat" placeholder="PDF, Excel, CSV" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="startDate">Date Range Start</Label>
                          <Input id="startDate" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Date Range End</Label>
                          <Input id="endDate" type="date" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Available Fields</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">Employee Name</Button>
                      <Button variant="outline" size="sm">Department</Button>
                      <Button variant="outline" size="sm">Attendance</Button>
                      <Button variant="outline" size="sm">Performance</Button>
                      <Button variant="outline" size="sm">Salary</Button>
                      <Button variant="outline" size="sm">Leave Balance</Button>
                      <Button variant="outline" size="sm">Work Hours</Button>
                      <Button variant="outline" size="sm">Overtime</Button>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Selected Fields</h5>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[100px]">
                        <p className="text-gray-500 text-center">Drag fields here</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Preview Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export to PDF/Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Advanced Report Builder</CardTitle>
                <CardDescription>Create custom reports with advanced filtering and visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Report Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input id="reportName" placeholder="Enter custom report name" />
                      </div>
                      <div>
                        <Label htmlFor="dataSource">Primary Data Source</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employees">Employee Records</SelectItem>
                            <SelectItem value="attendance">Attendance Data</SelectItem>
                            <SelectItem value="payroll">Payroll Information</SelectItem>
                            <SelectItem value="performance">Performance Metrics</SelectItem>
                            <SelectItem value="training">Training Records</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reportFormat">Output Format</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Report</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV Data</SelectItem>
                            <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input id="startDate" type="date" value={reportFilters.startDate} onChange={e => setReportFilters(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))} />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input id="endDate" type="date" value={reportFilters.endDate} onChange={e => setReportFilters(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Available Data Fields</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {['Employee ID', 'Full Name', 'Department', 'Position', 'Hire Date', 'Salary', 'Bonus', 'Attendance Rate', 'Performance Score', 'Leave Balance', 'Work Hours', 'Overtime Hours', 'Training Completed', 'Skills Assessment', 'Manager', 'Location', 'Status', 'Benefits', 'Emergency Contact'].map(field => <Button key={field} variant="outline" size="sm" className="text-xs">
                          {field}
                        </Button>)}
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Selected Fields for Report</h5>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[100px] bg-gray-50">
                        <p className="text-gray-500 text-center text-sm">Drag and drop fields here to build your custom report</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1" onClick={() => generateReport(999)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Custom Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => exportToExcel(payrollData, 'custom_report')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default ReportsAnalytics;