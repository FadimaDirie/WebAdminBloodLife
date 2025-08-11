import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Users, 
  BarChart3, 
  Link as LinkIcon, 
  Settings,
  X,
  Home
} from "lucide-react";
import DonorsList from "@/pages/donors-list";
import DonorStats from "@/pages/donor-stats";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
 
  // Place Donors List and Donor Stats together in the middle
  { name: 'Donors List Report', href: '/donors-list', icon: Users },
  { name: 'Donor Distrit Report', href: '/donor-stats', icon: BarChart3 },
  { name: 'Recent Donations Report', href: '/recent-donations', icon: Heart },
  { name: 'Today Donations', href: '/today-donations', icon: Activity },
  
  { name: 'User Management', href: '/users', icon: Users },
 
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-red-700 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 bg-transparent border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow">BLOOD LIFE</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            // Active state logic: handle /donors-list and /donor-stats exact match
            const isActive = location === item.href ||
              (item.href === '/users' && location.startsWith('/users')) ||
              (item.href === '/donors-list' && location.startsWith('/donors-list')) ||
              (item.href === '/donor-stats' && location.startsWith('/donor-stats'));
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "text-white bg-gradient-to-r from-red-500 to-red-400 shadow" 
                    : "text-white/80 hover:bg-white/10"
                )}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        {/* Logout Button */}
        <div className="px-4 pb-10">
          <Button
            variant="outline"
            className="w-full flex items-center gap-3 justify-center text-white border-white/30 hover:bg-red-800 mt-10 bg-gradient-to-r from-red-600 to-red-800 py-3 text-lg shadow-lg transition-all duration-200"
            onClick={() => { 
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setLocation('/login');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            <span className="font-bold tracking-wide">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
}
