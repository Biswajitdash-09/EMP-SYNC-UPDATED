
/**
 * Salary Components Configuration Component
 * Manages salary structure including earnings, deductions, and benefits
 * Provides inline editing capabilities for salary components
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSalaryComponents, useManageSalaryComponent } from '@/hooks/payroll/usePayrollQuery';

const SalaryComponents = () => {
  const { toast } = useToast();
  const { data: salaryComponents, isLoading } = useSalaryComponents();
  const manageSalaryComponent = useManageSalaryComponent();
  
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditComponent = (component: any) => {
    setEditingComponent(component.id);
    setEditValue(component.value?.toString() || component.percentage?.toString() || '');
  };

  const handleSaveComponent = (componentId: string) => {
    const component = salaryComponents?.find(c => c.id === componentId);
    if (!component) return;

    const numValue = parseFloat(editValue);
    manageSalaryComponent.mutate({
      id: componentId,
      name: component.name,
      type: component.type,
      calculation_type: component.calculation_type,
      value: component.calculation_type === 'fixed' ? numValue : null,
      percentage: component.calculation_type === 'percentage' ? numValue : null,
      is_active: component.is_active,
      is_taxable: component.is_taxable,
      description: component.description,
    });
    setEditingComponent(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingComponent(null);
    setEditValue('');
  };

  const renderComponentSection = (type: 'earning' | 'deduction' | 'benefit', title: string, bgColor: string, textColor: string) => {
    const components = salaryComponents?.filter(comp => comp.type === type) || [];
    
    return (
      <div className="space-y-4">
        <h4 className={`font-semibold ${textColor}`}>{title}</h4>
        <div className="space-y-2">
          {components.map((component) => {
            const displayValue = component.calculation_type === 'percentage' 
              ? `${component.percentage}%`
              : component.calculation_type === 'fixed'
              ? `$${component.value}`
              : 'Variable';
              
            return (
              <div key={component.id} className={`flex justify-between items-center p-2 ${bgColor} rounded`}>
                <span>{component.name}</span>
                <div className="flex items-center space-x-2">
                  {editingComponent === component.id ? (
                    <>
                      <Input 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 h-6 text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleSaveComponent(component.id)}
                        className="h-6 w-6 p-0"
                        disabled={manageSalaryComponent.isPending}
                      >
                        {manageSalaryComponent.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleCancelEdit}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span>{displayValue}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditComponent(component)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Components Configuration</CardTitle>
          <CardDescription>Manage base salary, bonuses, and deductions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading salary components...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Components Configuration</CardTitle>
        <CardDescription>Manage base salary, bonuses, and deductions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderComponentSection('earning', 'Earnings', 'bg-green-50', 'text-green-700')}
          {renderComponentSection('deduction', 'Deductions', 'bg-red-50', 'text-red-700')}
          {renderComponentSection('benefit', 'Benefits', 'bg-blue-50', 'text-blue-700')}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryComponents;
