import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  // Get user from localStorage
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);
  return (
    <header className="bg-red-500 shadow-sm border-b border-red-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-white hover:text-red-100"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-2xl font-bold text-white drop-shadow">Emergency Blood Donation Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 text-white hover:text-red-100 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-red-500 rounded-full animate-pulse"></span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-black">
                {user ? user.fullName : "Guest"}
                {user?.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold align-middle">Admin</span>
                )}
              </div>
              <div className="text-xs text-red-100">{user ? user.email : "Not logged in"}</div>
            </div>
            <Avatar className="w-8 h-8 border-2 border-white bg-gradient-to-br from-red-400 to-red-600">
              <AvatarImage src={user?.profilePic || undefined} />
              <AvatarFallback>{user ? (user.fullName?.[0] || "U") : "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
