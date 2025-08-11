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
  return Boolean(token && token !== "undefined" && token !== "null" && token !== "false");
}

function Protected(Component: React.ComponentType) {
  return function ProtectedComponent() {
    return isAuthenticated() ? <Component /> : <LoginPage />;
  };
}

function Router() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const loggedIn = isAuthenticated();

    // Redirect rules
    if (!loggedIn && currentPath !== "/login") {
      setLocation("/login");
      return;
    }
    if (loggedIn && (currentPath === "/" || currentPath === "/login" || currentPath === "/index" || currentPath === "/index.html")) {
      setLocation("/dashboard");
    }
  }, []);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/index.html" component={LoginPage} />
      <Route path="/" component={isAuthenticated() ? Dashboard : LoginPage} />
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
