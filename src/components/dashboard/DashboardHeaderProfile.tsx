
import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import ScheduleModal from './ScheduleModal';
import ReportsModal from './ReportsModal';

const DashboardHeaderProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg');
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@company.com'
  });

  // Load profile data on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('adminProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    const savedProfile = localStorage.getItem('adminProfileData');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData({
        name: parsed.name || 'Admin User',
        email: parsed.email || 'admin@company.com'
      });
    }
  }, []);

  const handleProfileUpdate = (updatedData: any) => {
    setProfileData({
      name: updatedData.name,
      email: updatedData.email
    });
    if (updatedData.profileImage) {
      setProfileImage(updatedData.profileImage);
    }
  };

  const handleLogout = () => {
    // Clear all stored user data
    localStorage.removeItem('adminProfileImage');
    localStorage.removeItem('adminProfileData');
    localStorage.removeItem('userSession');
    localStorage.removeItem('authToken');
    
    // Show logout confirmation
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1000);
    
    console.log('User logged out successfully');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={profileImage} 
                alt={profileData.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profileData.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{profileData.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setProfileOpen(true)}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setScheduleOpen(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>My Schedule</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setReportsOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>My Reports</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      {/* Schedule Modal */}
      <ScheduleModal 
        isOpen={scheduleOpen} 
        onClose={() => setScheduleOpen(false)} 
      />

      {/* Reports Modal */}
      <ReportsModal 
        isOpen={reportsOpen} 
        onClose={() => setReportsOpen(false)} 
      />
    </>
  );
};

export default DashboardHeaderProfile;
