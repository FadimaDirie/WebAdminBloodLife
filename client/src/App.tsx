import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import UserManagement from "@/pages/user-management";
import LoginPage from "@/pages/login";
import DonorsList from "@/pages/donors-list";
import DonorStats from "@/pages/donor-stats";
import RecentDonations from "@/pages/recent-donations";
import { useEffect } from "react";

function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const hasUser = Boolean(userStr && userStr !== "undefined" && userStr !== "null");
  const hasToken = Boolean(token && token !== "undefined" && token !== "null" && token !== "false");
  return hasToken && hasUser;
}

function Protected(Component: React.ComponentType) {
  return function ProtectedComponent() {
    return isAuthenticated() ? <Component /> : <LoginPage />;
  };
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const loggedIn = isAuthenticated();

    // Only redirect if not logged in and not already on login page
    if (!loggedIn && currentPath !== "/login" && currentPath !== "/index.html") {
      setLocation("/login");
      return;
    }
    // Only redirect to dashboard if logged in and on login-related pages
    if (loggedIn && (currentPath === "/" || currentPath === "/login" || currentPath === "/index" || currentPath === "/index.html")) {
      setLocation("/dashboard");
    }
  }, [location, setLocation]); // Run on every location change and refresh

  // Add event listeners for refresh and page focus
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This will trigger on refresh
      if (!isAuthenticated()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    const handleFocus = () => {
      // This will trigger when page regains focus (including after refresh)
      if (!isAuthenticated() && window.location.pathname !== "/login") {
        setLocation("/login");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
    };
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/index.html" component={LoginPage} />
      <Route path="/" component={Protected(Dashboard)} />
      <Route path="/dashboard" component={Protected(Dashboard)} />
      <Route path="/users" component={Protected(UserManagement)} />
      <Route path="/donors-list" component={Protected(DonorsList)} />
      <Route path="/donor-stats" component={Protected(DonorStats)} />
      <Route path="/recent-donations" component={Protected(RecentDonations)} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
