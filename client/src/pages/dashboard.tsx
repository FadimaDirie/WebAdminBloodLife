import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import EmergencyAlerts from "@/components/dashboard/emergency-alerts";
import StatsCards from "@/components/dashboard/stats-cards";
// import ChartsSection from "@/components/dashboard/charts-section";
import BloodInventory from "@/components/dashboard/blood-inventory";
import ReportsSection from "@/components/dashboard/reports-section";
import DonationsTable from "@/components/dashboard/donations-table";
import { mockDashboardData } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const BLOOD_TYPES = ["A+", "O+", "AB+", "O-", "A-", "B-", "AB-"];
const BLOOD_COLORS = [
  "#6366F1", // Indigo (A+)
  "#F59E42", // Orange (O+)
  "#10B981", // Green (AB+)
  "#EF4444", // Red (O-)
  "#3B82F6", // Blue (A-)
  "#F43F5E", // Pink (B-)
  "#A21CAF"  // Purple (AB-)
];



// Modern color palette for blood types
const RECENT_BLOOD_COLORS = [
  "#6366F1", // A+
  "#F59E42", // O+
  "#10B981", // B+
  "#EF4444", // AB+
  "#3B82F6", // A-
  "#F43F5E", // O-
  "#A21CAF", // B-
  "#FBBF24", // AB-
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [cityData, setCityData] = useState([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [lineData, setLineData] = useState<{ name: string; value: number }[]>([]);
  const [loadingLine, setLoadingLine] = useState(true);
  // Pie chart state for blood type distribution
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [loadingPie, setLoadingPie] = useState(true);
  // Add state for orders bar chart
  const [ordersBarData, setOrdersBarData] = useState<any[]>([]);
  const [loadingOrdersBar, setLoadingOrdersBar] = useState(false);
  // Add state for recent donations bar chart
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loadingRecentDonations, setLoadingRecentDonations] = useState(false);
  // New state for stat cards
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  // Fetch total users
  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/user/all")
      .then(res => res.json())
      .then(data => {
        setTotalUsers(Array.isArray(data.users) ? data.users.length : 0);
      });
  }, []);
  // Fetch total donors
  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/all")
      .then(res => res.json())
      .then(data => {
        setTotalDonors(Array.isArray(data.data) ? data.data.length : 0);
      });
  }, []);
  // Fetch total donations
  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        setTotalDonations(Array.isArray(data.orders) ? data.orders.length : 0);
      });
  }, []);

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

  useEffect(() => {
    setLoadingCity(true);
    fetch("https://bloods-service-api.onrender.com/api/donor/stats-by-city-and-blood")
      .then(res => res.json())
      .then(data => {
        // Show all blood types for each city as stacked bars
        const chartData = data.map((cityObj: any) => {
          const row: any = { city: cityObj.city };
          BLOOD_TYPES.forEach(type => {
            row[type] = cityObj.bloodGroups.find((bg: any) => bg.bloodType === type)?.count || 0;
          });
          return row;
        });
        setCityData(chartData);
        setLoadingCity(false);
      })
      .catch(() => setLoadingCity(false));
  }, []);

  useEffect(() => {
    setLoadingLine(true);
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Orders API response:", data);
        if (!data.orders || !Array.isArray(data.orders)) {
          console.error("Invalid data format:", data);
          setLineData([]);
          setLoadingLine(false);
          return;
        }
        // Group orders by date (YYYY-MM-DD)
        const counts: Record<string, number> = {};
        data.orders.forEach((order: any) => {
          if (order.createdAt) {
            const date = order.createdAt.slice(0, 10); // YYYY-MM-DD
            counts[date] = (counts[date] || 0) + 1;
          }
        });
        console.log("Processed line data:", counts);
        // Convert to array sorted by date
        const chartData = Object.entries(counts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, value]) => ({ name: date, value }));
        console.log("Final line chart data:", chartData);
        setLineData(chartData);
        setLoadingLine(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLineData([]);
        setLoadingLine(false);
      });
  }, []);

  useEffect(() => {
    setLoadingOrdersBar(true);
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        const orders = data.orders || [];
        // Group by city and blood type
        const cityStats: Record<string, any> = {};
        orders.forEach((order: any) => {
          const city = order.donorId?.city || "Unknown";
          const bloodType = order.donorId?.bloodType;
          if (!cityStats[city]) {
            cityStats[city] = { city };
            BLOOD_TYPES.forEach(type => cityStats[city][type] = 0);
          }
          if (bloodType && BLOOD_TYPES.includes(bloodType)) {
            cityStats[city][bloodType]++;
          }
        });
        const chartData = Object.values(cityStats);
        setOrdersBarData(chartData);
        setLoadingOrdersBar(false);
      })
      .catch(() => setLoadingOrdersBar(false));
  }, []);

  useEffect(() => {
    setLoadingRecentDonations(true);
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        const orders = data.orders || [];
        // Sort by most recent
        const sorted = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Show only the 15 most recent donations
        const recent = sorted.slice(0, 15).map((order: any) => ({
          donor: order.donorId?.fullName || "Unknown",
          recipient: order.requesterId?.fullName || "Unknown",
          bloodType: order.bloodType || "",
          unit: order.unit || 0,
          date: order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
        }));
        setRecentDonations(recent);
        setLoadingRecentDonations(false);
      })
      .catch(() => setLoadingRecentDonations(false));
  }, []);

  useEffect(() => {
    setLoadingPie(true);
    fetch("https://bloods-service-api.onrender.com/api/donor/all")
      .then(res => res.json())
      .then(data => {
        const donors = data.data || [];
        // For each blood type, find the first donor's name
        const chartData = BLOOD_TYPES.map(type => {
          const donor = donors.find((d: any) => d.bloodType && d.bloodType.toUpperCase() === type);
          return { name: type, value: donor ? donor.fullName : "No donor" };
        });
        setPieData(chartData);
        setLoadingPie(false);
      })
      .catch(() => setLoadingPie(false));
  }, []);

  // User profile state
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    // Try to get user from localStorage (as stringified JSON)
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Stat Cards Section - Redesigned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users Card */}
            <Card className="p-6 rounded-2xl shadow-md flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="text-sm font-semibold text-red-600">Total Users</div>
                  <div className="text-4xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-red-200 p-3">
                  {/* User icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 17.25c2.086 0 3.977.797 5.499 2.118" />
                  </svg>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">All registered users</div>
            </Card>
            {/* Total Donors Card */}
            <Card className="p-6 rounded-2xl shadow-md flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="text-sm font-semibold text-red-600">Total Donors</div>
                  <div className="text-4xl font-bold text-gray-900">{totalDonors.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-red-200 p-3">
                  {/* Group icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-6.13a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">All active donors</div>
            </Card>
            {/* Total Donations Card */}
            <Card className="p-6 rounded-2xl shadow-md flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="text-sm font-semibold text-red-600">Total Donations</div>
                  <div className="text-4xl font-bold text-gray-900">{totalDonations.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-red-200 p-3">
                  {/* Heartbeat icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l5.25 6.75L13.5 9l4.5 6h4.5" />
                  </svg>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">All donations recorded</div>
            </Card>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart: Blood Type Distribution */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Blood Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {loadingPie ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis type="category" dataKey="value" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value">
                          {pieData.map((entry, idx) => (
                            <Cell key={entry.name} fill={BLOOD_COLORS[idx % BLOOD_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Donut/Pie Chart */}
            {/* This section is removed as per the edit hint */}
              </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            {/* Stacked Bar Chart (City) */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Blood Types by City (Positive vs Negative)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[420px]">
                  {loadingCity ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {BLOOD_TYPES.map((type, idx) => (
                          <Line
                            key={type}
                            type="monotone"
                            dataKey={type}
                            stroke={BLOOD_COLORS[idx % BLOOD_COLORS.length]}
                            strokeWidth={3}
                            dot={false}
                            name={type}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Table Section as Bar Chart (if you want another bar chart here, you can add it) */}
            {/* You can add another bar chart or keep this empty for now */}
          </div>
          {/* Recent Donations Bar Chart */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Donations (Donor, Recipient, Blood Type)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {loadingRecentDonations ? (
                  <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentDonations} barCategoryGap={20}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="donor" angle={-30} textAnchor="end" height={80} interval={0} />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value, name, props) => {
                        const { payload } = props;
                        return [
                          `Unit: ${payload.unit}`,
                          `Recipient: ${payload.recipient}`,
                          `Blood Type: ${payload.bloodType}`,
                          `Date: ${payload.date}`
                        ];
                      }} />
                      {BLOOD_TYPES.map((type, idx) => (
                        <Bar
                          key={type}
                          dataKey={d => d.bloodType === type ? d.unit : 0}
                          fill={RECENT_BLOOD_COLORS[idx % RECENT_BLOOD_COLORS.length]}
                          name={type}
                          stackId="a"
                          isAnimationActive={false}
                        >
                          <LabelList dataKey="bloodType" position="top" />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Modern Line Chart Card */}
          {/* The following sections have been removed as requested: */}
          {/* - Recent Donations */}
          {/* - Generate Reports */}
          {/* - Blood Inventory Levels */}
          {/* - Critical Requests */}
          {/* - Blockchain Activity */}
        </main>
      </div>
    </div>
  );
}
