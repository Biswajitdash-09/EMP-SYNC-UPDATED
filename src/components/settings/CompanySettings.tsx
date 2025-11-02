
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Save, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  timezone: string;
  currency: string;
}

interface CompanySettingsProps {
  initialData?: CompanyData;
}

const CompanySettings = ({ initialData }: CompanySettingsProps) => {
  const { toast } = useToast();
  
  // Company Settings State
  const [companyData, setCompanyData] = useState<CompanyData>(initialData || {
    name: 'EMP SYNC Inc.',
    address: '123 Business Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@empsync.com',
    website: 'https://www.empsync.com',
    industry: 'Technology',
    timezone: 'UTC-8',
    currency: 'USD'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Company Settings Handlers
  const handleCompanyDataChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCompanyData = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Company information saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Company Profile Setup
        </CardTitle>
        <CardDescription>Configure your organization's basic information and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                value={companyData.name}
                onChange={(e) => handleCompanyDataChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={companyData.address}
                onChange={(e) => handleCompanyDataChange('address', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={companyData.phone}
                onChange={(e) => handleCompanyDataChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={companyData.email}
                onChange={(e) => handleCompanyDataChange('email', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                value={companyData.website}
                onChange={(e) => handleCompanyDataChange('website', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={companyData.industry} onValueChange={(value) => handleCompanyDataChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={companyData.timezone} onValueChange={(value) => handleCompanyDataChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                  <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                  <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                  <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                  <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                  <SelectItem value="UTC+5:30">UTC+5:30 (IST - Indian Standard Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={companyData.currency} onValueChange={(value) => handleCompanyDataChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleSaveCompanyData}
          disabled={isSaving}
          className="w-full md:w-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Company Information
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
