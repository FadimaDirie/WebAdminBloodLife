import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900">
            Emergency Blood Donation Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</div>
              <div className="text-xs text-gray-500">Emergency Coordinator</div>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
