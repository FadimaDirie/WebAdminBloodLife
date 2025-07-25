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

function Router() {
  const [, setLocation] = useLocation();

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // if not logged in and not already on /login, redirect to login
    if (!isLoggedIn && window.location.pathname !== "/login") {
      setLocation("/login");
    }
  }, [isLoggedIn]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/users" component={UserManagement} />
      <Route path="/donors-list" component={DonorsList} />
      <Route path="/donor-stats" component={DonorStats} />
      <Route path="/recent-donations" component={RecentDonations} />
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
