import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import EmergencyAlerts from "@/components/dashboard/emergency-alerts";
import StatsCards from "@/components/dashboard/stats-cards";
import ChartsSection from "@/components/dashboard/charts-section";
import BloodInventory from "@/components/dashboard/blood-inventory";
import ReportsSection from "@/components/dashboard/reports-section";
import DonationsTable from "@/components/dashboard/donations-table";
import { mockDashboardData } from "@/lib/mock-data";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          todayDonations: prev.stats.todayDonations + Math.floor(Math.random() * 3),
          blockchainTxs: prev.stats.blockchainTxs + Math.floor(Math.random() * 10),
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <EmergencyAlerts alerts={dashboardData.emergencyAlerts} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <StatsCards stats={dashboardData.stats} />
          
          <ChartsSection 
            donationsData={dashboardData.donationsChart}
            bloodTypeData={dashboardData.bloodTypeDistribution}
            responseTimeData={dashboardData.responseTime}
            donorActivityData={dashboardData.donorActivity}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BloodInventory inventory={dashboardData.bloodInventory} />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Critical Requests</h3>
                  <span className="text-sm text-red-600 font-medium">
                    {dashboardData.criticalRequests.length} Active
                  </span>
                </div>
                <div className="space-y-3">
                  {dashboardData.criticalRequests.map((request, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      request.urgency === 'URGENT' ? 'bg-red-50 border-red-200' :
                      request.urgency === 'HIGH' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          request.urgency === 'URGENT' ? 'text-red-700' :
                          request.urgency === 'HIGH' ? 'text-yellow-700' :
                          'text-orange-700'
                        }`}>
                          {request.type}
                        </span>
                        <span className={`text-xs ${
                          request.urgency === 'URGENT' ? 'text-red-600' :
                          request.urgency === 'HIGH' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {request.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.hospital}</p>
                      <p className="text-xs text-gray-500">{request.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Blockchain Activity</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {dashboardData.blockchainActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'Donation Verified' ? 'bg-green-500' :
                        activity.type === 'Request Matched' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.type}</p>
                        <p className="text-xs text-gray-500 font-mono">{activity.hash}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <ReportsSection />
          
          <DonationsTable donations={dashboardData.donations} />
        </main>
      </div>
    </div>
  );
}
