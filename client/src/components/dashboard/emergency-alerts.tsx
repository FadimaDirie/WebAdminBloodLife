import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EmergencyAlert {
  id: string;
  message: string;
  count: number;
}

interface EmergencyAlertsProps {
  alerts: EmergencyAlert[];
}

export default function EmergencyAlerts({ alerts }: EmergencyAlertsProps) {
  const criticalCount = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <div className="px-6 py-4 bg-red-50 border-b border-red-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-slow"></div>
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            URGENT: {criticalCount} Critical Blood Requests Active
          </span>
        </div>
        <Button 
          size="sm"
          className="bg-red-600 text-white hover:bg-red-700"
        >
          View All Alerts
        </Button>
      </div>
    </div>
  );
}
