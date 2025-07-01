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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Emergency Requests', href: '/emergency', icon: AlertTriangle },
  { name: 'Blood Inventory', href: '/inventory', icon: Heart },
  { name: 'Donor Management', href: '/donors', icon: Users },
  { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
  { name: 'Blockchain Logs', href: '/blockchain', icon: LinkIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 bg-primary text-primary-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BloodChain</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "text-white bg-primary" 
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
